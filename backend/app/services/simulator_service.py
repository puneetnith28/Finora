from decimal import Decimal

from app.schemas.simulator import FoirSimulatorRequest, FoirSimulatorResponse
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
