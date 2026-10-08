"""Integrated Deterministic Financial Engine Orchestrator for Finora."""

from decimal import Decimal

from pydantic import BaseModel, Field

from app.services.collateral_calculator import (
    CollateralItemInput,
    CollateralValuationResult,
    calculate_collateral_value,
)
from app.services.emi_calculator import (
    EMIInput,
    EMIResult,
    calculate_emi,
)
from app.services.foir_calculator import (
    FOIRInput,
    FOIRResult,
    calculate_foir,
)
from app.services.funding_calculator import (
    FundingCalculationResult,
    FundingItem,
    calculate_available_funding,
)
from app.services.funding_gap_calculator import (
    FundingGapInput,
    FundingGapResult,
    calculate_funding_gap,
)
from app.services.ltv_calculator import (
    LTVInput,
    LTVResult,
    calculate_ltv,
)
from app.services.net_worth_calculator import (
    AssetSummaryItem,
    LiabilitySummaryItem,
    NetWorthCalculationInput,
    NetWorthCalculationResult,
    calculate_net_worth,
)
from app.services.study_cost_calculator import (
    StudyCostBreakdown,
    StudyCostResult,
    calculate_study_cost,
)


class ComprehensiveFinancialInput(BaseModel):
    study_cost: StudyCostBreakdown
    funding_sources: list[FundingItem] = Field(default_factory=list)
    assets: list[AssetSummaryItem] = Field(default_factory=list)
    liabilities: list[LiabilitySummaryItem] = Field(default_factory=list)
    collaterals: list[CollateralItemInput] = Field(default_factory=list)
    monthly_net_income_inr: Decimal = Field(default=Decimal("0.0"), ge=0)
    requested_loan_amount_inr: Decimal | None = None
    expected_interest_rate_percent: Decimal = Field(default=Decimal("10.50"), ge=0, le=100)
    loan_tenure_months: int = Field(default=120, ge=1, le=480)


class ComprehensiveFinancialSummary(BaseModel):
    study_cost: StudyCostResult
    funding: FundingCalculationResult
    funding_gap: FundingGapResult
    net_worth: NetWorthCalculationResult
    collateral: CollateralValuationResult
    emi: EMIResult
    foir: FOIRResult
    ltv: LTVResult
    readiness_score: Decimal  # 0.00 - 100.00
    readiness_band: str  # excellent | strong | moderate | weak | high_risk
    key_highlights: list[str]


def compute_readiness_score(
    funding_gap: FundingGapResult,
    net_worth: NetWorthCalculationResult,
    foir: FOIRResult,
    ltv: LTVResult,
) -> tuple[Decimal, str, list[str]]:
    """Compute deterministic weighted readiness score (0-100) based on 4 financial pillars.

    Pillars:
      1. Funding Coverage (35 points): Based on coverage ratio
      2. Debt Affordability / FOIR (25 points): Based on FOIR ratio
      3. Collateral & Security (20 points): Based on LTV and coverage status
      4. Solvency & Liquidity (20 points): Based on net worth and liquid assets
    """
    score = Decimal("0.00")
    highlights: list[str] = []

    # 1. Funding Coverage (Max 35)
    if funding_gap.coverage_ratio >= Decimal("1.00"):
        score += Decimal("35.00")
        highlights.append("Complete self-funding coverage achieved.")
    elif funding_gap.coverage_ratio >= Decimal("0.50"):
        score += Decimal("25.00")
        highlights.append("Strong self-funding foundation covering over 50% of expenses.")
    elif funding_gap.coverage_ratio >= Decimal("0.20"):
        score += Decimal("15.00")
        highlights.append("Partial funding in place; loan bridge required.")
    else:
        score += Decimal("5.00")
        highlights.append("Significant funding gap; substantial loan financing required.")

    # 2. Debt Affordability / FOIR (Max 25)
    if foir.foir_percentage <= Decimal("40.00") and foir.monthly_net_income_inr > 0:
        score += Decimal("25.00")
        highlights.append("Excellent debt-to-income affordability (FOIR <= 40%).")
    elif foir.foir_percentage <= Decimal("60.00") and foir.monthly_net_income_inr > 0:
        score += Decimal("18.00")
        highlights.append("Moderate debt service burden within standard lending limits.")
    elif foir.foir_percentage <= Decimal("80.00") and foir.monthly_net_income_inr > 0:
        score += Decimal("10.00")
        highlights.append("Elevated FOIR; strong co-borrower may be required.")
    else:
        score += Decimal("2.00")
        highlights.append("Critical FOIR burden or zero verifiable co-applicant income.")

    # 3. Collateral & Security (Max 20)
    if ltv.coverage_status == "fully_secured":
        score += Decimal("20.00")
        highlights.append("Loan fully backed by eligible collateral.")
    elif ltv.coverage_status == "partially_secured":
        score += Decimal("12.00")
        highlights.append("Partial collateral backing reduces lender credit risk.")
    else:
        score += Decimal("5.00")
        highlights.append(
            "Unsecured application; admission profile & test scores will be paramount."
        )

    # 4. Solvency & Liquidity (Max 20)
    if net_worth.is_solvent and net_worth.total_liquid_assets_inr >= Decimal("500000.00"):
        score += Decimal("20.00")
        highlights.append("Strong solvency with ample liquid emergency buffer.")
    elif net_worth.is_solvent and net_worth.total_liquid_assets_inr > 0:
        score += Decimal("14.00")
        highlights.append("Positive net worth with existing liquidity.")
    elif net_worth.is_solvent:
        score += Decimal("8.00")
        highlights.append("Solvent asset base primarily comprised of fixed assets.")
    else:
        score += Decimal("0.00")
        highlights.append("Liabilities exceed current assets.")

    final_score = min(Decimal("100.00"), max(Decimal("0.00"), score)).quantize(Decimal("0.01"))

    if final_score >= Decimal("85.00"):
        band = "excellent"
    elif final_score >= Decimal("70.00"):
        band = "strong"
    elif final_score >= Decimal("55.00"):
        band = "moderate"
    elif final_score >= Decimal("40.00"):
        band = "weak"
    else:
        band = "high_risk"

    return final_score, band, highlights


def run_full_financial_engine(
    input_data: ComprehensiveFinancialInput,
) -> ComprehensiveFinancialSummary:
    """Run all deterministic financial engines and aggregate results into a unified summary."""
    # 1. Study cost
    study_cost_res = calculate_study_cost(input_data.study_cost)

    # 2. Available funding
    funding_res = calculate_available_funding(input_data.funding_sources)

    # 3. Funding gap
    gap_res = calculate_funding_gap(
        FundingGapInput(
            total_study_cost_inr=study_cost_res.total_cost_inr,
            available_funding_inr=funding_res.total_funding_inr,
        )
    )

    # 4. Net worth
    net_worth_res = calculate_net_worth(
        NetWorthCalculationInput(
            assets=input_data.assets,
            liabilities=input_data.liabilities,
        )
    )

    # 5. Collateral value
    collateral_res = calculate_collateral_value(input_data.collaterals)

    # 6. Loan amount to evaluate
    loan_to_evaluate = (
        input_data.requested_loan_amount_inr
        if input_data.requested_loan_amount_inr is not None
        else gap_res.recommended_loan_amount_inr
    )

    # 7. EMI
    emi_res = calculate_emi(
        EMIInput(
            principal_inr=loan_to_evaluate,
            annual_interest_rate_percent=input_data.expected_interest_rate_percent,
            tenure_months=input_data.loan_tenure_months,
        )
    )

    # 8. FOIR
    foir_res = calculate_foir(
        FOIRInput(
            monthly_net_income_inr=input_data.monthly_net_income_inr,
            existing_monthly_emi_inr=net_worth_res.total_monthly_emi_inr,
            proposed_monthly_emi_inr=emi_res.monthly_emi_inr,
        )
    )

    # 9. LTV
    ltv_res = calculate_ltv(
        LTVInput(
            requested_loan_amount_inr=loan_to_evaluate,
            eligible_collateral_value_inr=collateral_res.total_eligible_value_inr,
        )
    )

    # 10. Readiness Score
    readiness_score, readiness_band, highlights = compute_readiness_score(
        funding_gap=gap_res,
        net_worth=net_worth_res,
        foir=foir_res,
        ltv=ltv_res,
    )

    return ComprehensiveFinancialSummary(
        study_cost=study_cost_res,
        funding=funding_res,
        funding_gap=gap_res,
        net_worth=net_worth_res,
        collateral=collateral_res,
        emi=emi_res,
        foir=foir_res,
        ltv=ltv_res,
        readiness_score=readiness_score,
        readiness_band=readiness_band,
        key_highlights=highlights,
    )
