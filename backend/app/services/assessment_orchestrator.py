"""Full Assessment Orchestrator for Finora.

Coordinates student domain entities, runs the deterministic financial calculation engine,
evaluates all active lender criteria with complete auditability, and persists results.
"""

from datetime import UTC, datetime
from decimal import Decimal

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.seed_lenders import seed_demo_lenders
from app.models.assessment import (
    Assessment,
    AssessmentResult,
    AssessmentRuleResult,
    AssessmentStatus,
)
from app.models.collateral import Collateral
from app.models.financial_profile import FinancialProfile
from app.models.funding_source import FundingSource
from app.models.lender import CriterionOperator, CriterionType, Lender, LenderCriterion
from app.models.student import Student
from app.models.study_plan import StudyPlan
from app.services.collateral_calculator import CollateralItemInput
from app.services.currency_service import get_default_exchange_rate
from app.services.financial_engine import (
    ComprehensiveFinancialInput,
    ComprehensiveFinancialSummary,
    run_full_financial_engine,
)
from app.services.funding_calculator import FundingItem
from app.services.net_worth_calculator import AssetSummaryItem, LiabilitySummaryItem
from app.services.rules.lender_evaluator import (
    CandidateAssessmentContext,
    LenderEvaluationResult,
    LenderProfile,
    evaluate_lender,
)
from app.services.rules.rule_types import (
    RuleDefinition,
    RuleOperator,
    RuleSeverity,
    RuleType,
)
from app.services.study_cost_calculator import StudyCostBreakdown


class FullAssessmentReport(BaseModel):
    assessment_id: int
    student_id: int
    student_name: str
    status: str
    financial_summary: ComprehensiveFinancialSummary
    lender_evaluations: list[LenderEvaluationResult]
    total_lenders_evaluated: int
    matching_lenders_count: int
    review_lenders_count: int
    created_at: datetime
    disclaimer: str = (
        "Indicative assessment based on provided data. Not a guaranteed sanction or formal loan offer."
    )


def map_db_criterion_to_rule_def(crit: LenderCriterion) -> RuleDefinition | None:
    """Map DB LenderCriterion to engine RuleDefinition."""
    # Map rule type
    type_mapping = {
        CriterionType.MIN_CIBIL: RuleType.MIN_CIBIL_SCORE,
        CriterionType.MAX_FOIR: RuleType.MAXIMUM_FOIR,
        CriterionType.MAX_LOAN_AMOUNT: RuleType.MAXIMUM_LOAN_AMOUNT,
        CriterionType.TARGET_COUNTRY: RuleType.COUNTRY_ALLOWED,
        CriterionType.MIN_COURSE_LEVEL: RuleType.COURSE_LEVEL_ALLOWED,
        CriterionType.COLLATERAL_REQUIRED: RuleType.COLLATERAL_REQUIRED,
        CriterionType.MIN_LIQUID_ASSETS_RATIO: RuleType.MIN_LIQUID_ASSETS_RATIO,
        CriterionType.MIN_CO_BORROWER_INCOME: RuleType.MINIMUM_INCOME,
    }

    rule_type = type_mapping.get(crit.criterion_type)
    if not rule_type:
        return None

    # Map operator
    op_mapping = {
        CriterionOperator.GTE: RuleOperator.GTE,
        CriterionOperator.LTE: RuleOperator.LTE,
        CriterionOperator.EQ: RuleOperator.EQ,
        CriterionOperator.NEQ: RuleOperator.NEQ,
        CriterionOperator.IN: RuleOperator.IN,
        CriterionOperator.NOT_IN: RuleOperator.NOT_IN,
        CriterionOperator.CONTAINS: RuleOperator.IN,
    }
    op = op_mapping.get(crit.operator, RuleOperator.GTE)

    expected_list: list[str] = []
    if crit.threshold_text:
        expected_list = [t.strip() for t in crit.threshold_text.split(",")]

    severity = RuleSeverity.HARD_CONSTRAINT if crit.required else RuleSeverity.REVIEW

    return RuleDefinition(
        rule_type=rule_type,
        operator=op,
        expected_numeric=crit.threshold_value,
        expected_text=crit.threshold_text,
        expected_list=expected_list,
        severity=severity,
        weight=crit.weight or Decimal("1.00"),
        description=f"{crit.criterion_type.value} criterion for lender {crit.lender_id}",
    )


def run_candidate_assessment(
    student_id: int,
    db: Session,
    requested_loan_amount_inr: Decimal | None = None,
) -> FullAssessmentReport:
    """Run full deterministic calculation and lender assessment for a student."""
    # 1. Fetch Student and related entities
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student with id {student_id} not found")

    study_plan = (
        db.query(StudyPlan)
        .filter(StudyPlan.student_id == student_id)
        .order_by(StudyPlan.id.desc())
        .first()
    )

    funding_sources = (
        db.query(FundingSource).filter(FundingSource.student_id == student_id).all()
    )

    fin_profile = (
        db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    )

    collaterals = db.query(Collateral).filter(Collateral.student_id == student_id).all()

    # 2. Build Study Cost Input
    currency = study_plan.currency if study_plan else "USD"
    rate = (
        study_plan.exchange_rate_to_inr
        if (study_plan and study_plan.exchange_rate_to_inr)
        else get_default_exchange_rate(currency)
    )

    study_cost_input = StudyCostBreakdown(
        tuition_fee=study_plan.tuition_fee if study_plan else Decimal("0.0"),
        living_expense=study_plan.living_expenses if study_plan else Decimal("0.0"),
        travel_expense=study_plan.travel_expenses if study_plan else Decimal("0.0"),
        other_expense=study_plan.other_expenses if study_plan else Decimal("0.0"),
        duration_months=study_plan.duration_months if study_plan else 12,
        currency=currency,
        exchange_rate=rate,
    )

    # 3. Build Funding Items
    funding_items: list[FundingItem] = []
    for f in funding_sources:
        f_rate = (
            f.exchange_rate_to_inr if f.exchange_rate_to_inr else get_default_exchange_rate(f.currency)
        )
        funding_items.append(
            FundingItem(
                funding_type=f.source_type,
                source_name=f.source_type.value,
                amount=f.amount_original,
                currency=f.currency,
                exchange_rate=f_rate,
            )
        )

    # 4. Build Assets & Liabilities
    asset_items: list[AssetSummaryItem] = []
    liability_items: list[LiabilitySummaryItem] = []
    monthly_income = Decimal("0.0")
    cibil_score = 700

    if fin_profile:
        monthly_income = fin_profile.monthly_income or Decimal("0.0")

    for a in student.assets:
        asset_items.append(
            AssetSummaryItem(
                asset_type=a.asset_type,
                estimated_value_inr=a.estimated_value_inr,
                is_liquid=a.is_liquid,
                description=a.description,
            )
        )

    for liab in student.liabilities:
        liability_items.append(
            LiabilitySummaryItem(
                liability_type=liab.liability_type,
                outstanding_amount_inr=liab.outstanding_amount_inr,
                monthly_emi_inr=liab.monthly_emi_inr,
                lender_name=liab.lender_name,
            )
        )

    # 5. Build Collaterals
    collateral_items: list[CollateralItemInput] = []
    for c in collaterals:
        collateral_items.append(
            CollateralItemInput(
                collateral_type=c.collateral_type,
                ownership_status=c.ownership_status,
                market_value_inr=c.market_value_inr,
                existing_encumbrance_inr=c.existing_encumbrance_inr,
                description=c.description,
            )
        )

    # 6. Run Full Financial Calculation Engine
    financial_input = ComprehensiveFinancialInput(
        study_cost=study_cost_input,
        funding_sources=funding_items,
        assets=asset_items,
        liabilities=liability_items,
        collaterals=collateral_items,
        monthly_net_income_inr=monthly_income,
        requested_loan_amount_inr=requested_loan_amount_inr,
    )
    fin_summary = run_full_financial_engine(financial_input)

    # 7. Evaluate Lenders
    active_lenders = db.query(Lender).filter(Lender.active.is_(True)).all()
    if not active_lenders:
        active_lenders = seed_demo_lenders(db)
    candidate_context = CandidateAssessmentContext(
        target_country=student.target_country or "USA",
        target_course_level="masters",
        cibil_score=cibil_score,
        has_collateral=len(collateral_items) > 0,
        co_borrower_monthly_income_inr=monthly_income,
        documents_uploaded=[doc.file_name for doc in student.documents] if student.documents else [],
        financial_summary=fin_summary,
    )

    lender_evaluations: list[LenderEvaluationResult] = []
    for l_model in active_lenders:
        criteria_defs: list[RuleDefinition] = []
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
        lender_eval = evaluate_lender(profile, candidate_context)
        lender_evaluations.append(lender_eval)

    # 8. Persist Assessment in DB
    assessment = Assessment(
        student_id=student_id,
        requested_loan_amount=(
            requested_loan_amount_inr
            if requested_loan_amount_inr is not None
            else fin_summary.funding_gap.recommended_loan_amount_inr
        ),
        status=AssessmentStatus.COMPLETED,
        completed_at=datetime.now(UTC),
    )
    db.add(assessment)
    db.flush()

    assessment_result = AssessmentResult(
        assessment_id=assessment.id,
        total_study_cost=fin_summary.study_cost.total_cost_inr,
        available_funding=fin_summary.funding.total_funding_inr,
        funding_gap=fin_summary.funding_gap.funding_gap_inr,
        net_worth=fin_summary.net_worth.net_worth_inr,
        foir=fin_summary.foir.foir_ratio,
        ltv=fin_summary.ltv.ltv_ratio,
        readiness_score=fin_summary.readiness_score,
    )
    db.add(assessment_result)
    db.flush()

    for l_eval in lender_evaluations:
        for rule_res in l_eval.rule_results:
            rule_entry = AssessmentRuleResult(
                assessment_result_id=assessment_result.id,
                lender_id=l_eval.lender_id,
                passed=rule_res.passed,
                actual_value=rule_res.actual_value[:250] if rule_res.actual_value else None,
                expected_value=rule_res.expected_value[:250] if rule_res.expected_value else None,
                reason=rule_res.reason,
            )
            db.add(rule_entry)

    db.commit()
    db.refresh(assessment)

    match_count = sum(1 for e in lender_evaluations if e.outcome_state.value == "potential_match")
    review_count = sum(1 for e in lender_evaluations if e.outcome_state.value == "needs_review")

    return FullAssessmentReport(
        assessment_id=assessment.id,
        student_id=student.id,
        student_name=student.name,
        status=assessment.status.value,
        financial_summary=fin_summary,
        lender_evaluations=lender_evaluations,
        total_lenders_evaluated=len(lender_evaluations),
        matching_lenders_count=match_count,
        review_lenders_count=review_count,
        created_at=assessment.created_at,
    )
