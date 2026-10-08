from decimal import Decimal

from sqlalchemy.orm import Session

from app.schemas.simulator import (
    FoirSimulatorRequest,
    FoirSimulatorResponse,
    LenderImpactItem,
    LenderImpactSimRequest,
    LenderImpactSimResponse,
)
from app.services.emi_calculator import EMIInput, calculate_emi
from app.services.foir_calculator import FOIRInput, calculate_foir


def run_foir_simulation(req: FoirSimulatorRequest) -> FoirSimulatorResponse:
    """Simulate EMI, aggregate obligations, calculate FOIR and generate risk badge."""
    # 1. Calculate new simulated EMI
    emi_res = calculate_emi(
        EMIInput(
            principal_inr=req.loan_amount_inr,
            annual_interest_rate_percent=req.annual_interest_rate_percent,
            tenure_months=req.tenure_months,
        )
    )
    simulated_emi = emi_res.monthly_emi_inr

    # 2. Total obligations = existing + simulated
    total_obligations = req.existing_monthly_obligations_inr + simulated_emi

    # 3. Calculate FOIR using deterministic engine
    foir_result = calculate_foir(
        FOIRInput(
            monthly_net_income_inr=req.monthly_net_income_inr,
            existing_monthly_emi_inr=req.existing_monthly_obligations_inr,
            proposed_monthly_emi_inr=simulated_emi,
        )
    )

    foir_pct = float(foir_result.foir_percentage)


    # 4. Status determination
    if foir_pct <= 40.0:
        status_badge = "Safe"
    elif foir_pct <= 50.0:
        status_badge = "Moderate"
    elif foir_pct <= 60.0:
        status_badge = "Stretched"
    else:
        status_badge = "High Risk"

    # 5. Max affordable EMI at standard 50% FOIR cap
    max_total_allowed = (req.monthly_net_income_inr * Decimal("0.50")).quantize(Decimal("0.01"))
    max_affordable_emi = max(Decimal("0.0"), max_total_allowed - req.existing_monthly_obligations_inr)

    # 6. Remedial suggestions
    suggestions: list[str] = []
    if foir_pct > 50.0:
        suggestions.append("Extend loan tenure (e.g. 10 to 15 years) to reduce monthly EMI burden.")
        suggestions.append("Add an additional earning co-borrower (parents/sibling) to expand household income base.")
        suggestions.append("Foreclose or prepay small existing obligations to free up debt capacity.")
    elif foir_pct > 40.0:
        suggestions.append("Within acceptable lender limits, but consider lower interest rate tier lenders (e.g., Public Sector Banks).")
    else:
        suggestions.append("Optimal FOIR profile. Highly attractive to Tier-1 prime lenders.")

    return FoirSimulatorResponse(
        loan_amount_inr=req.loan_amount_inr,
        annual_interest_rate_percent=req.annual_interest_rate_percent,
        tenure_months=req.tenure_months,
        monthly_income_inr=req.monthly_net_income_inr,
        existing_obligations_inr=req.existing_monthly_obligations_inr,
        simulated_emi_inr=simulated_emi,
        total_monthly_obligations_inr=total_obligations,
        foir_ratio=foir_result.foir_ratio,
        foir_percentage=foir_pct,
        status_badge=status_badge,
        max_affordable_emi_inr=max_affordable_emi,
        remedial_suggestions=suggestions,
    )


def simulate_lender_impact(
    db: Session,
    req: LenderImpactSimRequest,
) -> LenderImpactSimResponse:
    """Simulate lender evaluation changes when loan terms / FOIR / collateral change."""
    from app.db.seed_lenders import seed_demo_lenders
    from app.models.lender import Lender
    from app.services.assessment_orchestrator import map_db_criterion_to_rule_def
    from app.services.collateral_calculator import CollateralItemInput
    from app.services.financial_engine import (
        ComprehensiveFinancialInput,
        run_full_financial_engine,
    )
    from app.services.net_worth_calculator import AssetSummaryItem, LiabilitySummaryItem
    from app.services.rules.lender_evaluator import (
        CandidateAssessmentContext,
        LenderProfile,
        evaluate_lender,
    )
    from app.services.study_cost_calculator import StudyCostBreakdown

    # 1. Fetch active lenders or seed demo lenders
    lenders = db.query(Lender).filter(Lender.active.is_(True)).all()
    if not lenders:
        lenders = seed_demo_lenders(db)

    def create_context(loan_amt: Decimal, interest_pct: Decimal, tenure_m: int) -> tuple[CandidateAssessmentContext, Decimal, float]:
        study_cost_in = StudyCostBreakdown(
            tuition_fee=loan_amt,
            living_expense=loan_amt * Decimal("0.2"),
            duration_months=tenure_m,
            currency="INR",
            exchange_rate=Decimal("1.0"),
        )
        liabs = [
            LiabilitySummaryItem(
                liability_type="personal_loan",
                outstanding_amount_inr=req.existing_monthly_obligations_inr * Decimal("36"),
                monthly_emi_inr=req.existing_monthly_obligations_inr,
                lender_name="Existing Lender",
            )
        ] if req.existing_monthly_obligations_inr > 0 else []

        assets = [
            AssetSummaryItem(
                asset_type="fixed_deposit",
                estimated_value_inr=Decimal("500000.00"),
                is_liquid=True,
                description="Savings FD",
            )
        ]
        colls = [
            CollateralItemInput(
                collateral_type="property",
                ownership_status="sole",
                market_value_inr=Decimal("5000000.00"),
                existing_encumbrance_inr=Decimal("0.0"),
                description="Residential Property",
            )
        ] if req.has_collateral else []

        fin_in = ComprehensiveFinancialInput(
            study_cost=study_cost_in,
            funding_sources=[],
            assets=assets,
            liabilities=liabs,
            collaterals=colls,
            monthly_net_income_inr=req.co_borrower_monthly_income_inr,
            requested_loan_amount_inr=loan_amt,
            expected_interest_rate_percent=interest_pct,
            loan_tenure_months=tenure_m,
        )
        fin_sum = run_full_financial_engine(fin_in)

        ctx = CandidateAssessmentContext(
            target_country=req.target_country,
            target_course_level="masters",
            cibil_score=req.cibil_score,
            has_collateral=req.has_collateral,
            co_borrower_monthly_income_inr=req.co_borrower_monthly_income_inr,
            documents_uploaded=["passport.pdf", "admission_letter.pdf", "salary_slip.pdf"],
            financial_summary=fin_sum,
        )
        emi_val = fin_sum.emi.monthly_emi_inr if fin_sum.emi else Decimal("0.0")
        foir_val = float(fin_sum.foir.foir_percentage)
        return ctx, emi_val, foir_val

    base_ctx, _, _ = create_context(req.simulated_loan_amount_inr * Decimal("0.8"), Decimal("10.0"), 120)
    sim_ctx, sim_emi, sim_foir_pct = create_context(req.simulated_loan_amount_inr, req.simulated_interest_rate_percent, req.simulated_tenure_months)

    impact_items: list[LenderImpactItem] = []
    matched_cnt = 0
    review_cnt = 0
    ineligible_cnt = 0

    for l_model in lenders:
        criteria_defs = []
        for crit in l_model.criteria:
            r_def = map_db_criterion_to_rule_def(crit)
            if r_def:
                criteria_defs.append(r_def)

        profile = LenderProfile(
            id=l_model.id,
            name=l_model.name,
            description=l_model.description,
            active=l_model.active,
            criteria=criteria_defs,
        )

        base_res = evaluate_lender(profile, base_ctx)
        sim_res = evaluate_lender(profile, sim_ctx)

        base_st = base_res.outcome_state.value
        sim_st = sim_res.outcome_state.value

        if sim_st == "potential_match":
            matched_cnt += 1
        elif sim_st == "needs_review":
            review_cnt += 1
        else:
            ineligible_cnt += 1

        changed = (base_st != sim_st)
        delta = "unchanged"
        if base_st != sim_st:
            if sim_st == "potential_match":
                delta = "upgraded"
            elif sim_st == "not_eligible" or (base_st == "potential_match" and sim_st == "needs_review"):
                delta = "downgraded"

        reasons: list[str] = []
        for r in sim_res.rule_results:
            if not r.passed:
                reasons.append(f"{r.rule_type}: {r.reason}")

        if changed:
            summary = f"Changed from {base_st.replace('_', ' ').title()} to {sim_st.replace('_', ' ').title()} under simulated terms."
        else:
            summary = f"Remains {sim_st.replace('_', ' ').title()}."

        impact_items.append(
            LenderImpactItem(
                lender_id=l_model.id,
                lender_name=l_model.name,
                baseline_status=base_st,
                simulated_status=sim_st,
                status_changed=changed,
                status_delta=delta,
                impact_summary=summary,
                reasons=reasons,
            )
        )

    return LenderImpactSimResponse(
        simulated_loan_amount_inr=req.simulated_loan_amount_inr,
        simulated_emi_inr=sim_emi,
        simulated_foir_percentage=sim_foir_pct,
        total_lenders=len(impact_items),
        matched_count=matched_cnt,
        review_count=review_cnt,
        ineligible_count=ineligible_cnt,
        lender_impacts=impact_items,
    )


