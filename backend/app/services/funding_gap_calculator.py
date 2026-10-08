"""Deterministic Funding Gap Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field


class FundingGapInput(BaseModel):
    total_study_cost_inr: Decimal = Field(..., ge=0, description="Total study cost in INR")
    available_funding_inr: Decimal = Field(
        ..., ge=0, description="Total available self-funding in INR"
    )


class FundingGapResult(BaseModel):
    total_study_cost_inr: Decimal
    available_funding_inr: Decimal
    funding_gap_inr: Decimal
    surplus_funding_inr: Decimal
    has_gap: bool
    coverage_ratio: Decimal
    recommended_loan_amount_inr: Decimal


def calculate_funding_gap(gap_input: FundingGapInput) -> FundingGapResult:
    """Calculate the funding gap, surplus, coverage ratio, and recommended loan amount."""
    cost = gap_input.total_study_cost_inr.quantize(Decimal("0.01"))
    funding = gap_input.available_funding_inr.quantize(Decimal("0.01"))

    diff = cost - funding

    if diff > Decimal("0.00"):
        funding_gap = diff.quantize(Decimal("0.01"))
        surplus = Decimal("0.00")
        has_gap = True
        recommended_loan = funding_gap
    else:
        funding_gap = Decimal("0.00")
        surplus = (-diff).quantize(Decimal("0.01"))
        has_gap = False
        recommended_loan = Decimal("0.00")

    if cost > Decimal("0.00"):
        coverage = (funding / cost).quantize(Decimal("0.0001"))
    else:
        coverage = Decimal("1.0000") if funding >= Decimal("0.00") else Decimal("0.0000")

    return FundingGapResult(
        total_study_cost_inr=cost,
        available_funding_inr=funding,
        funding_gap_inr=funding_gap,
        surplus_funding_inr=surplus,
        has_gap=has_gap,
        coverage_ratio=coverage,
        recommended_loan_amount_inr=recommended_loan,
    )
