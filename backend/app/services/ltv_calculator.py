"""Deterministic Loan-To-Value (LTV) Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field


class LTVInput(BaseModel):
    requested_loan_amount_inr: Decimal = Field(
        ..., ge=0, description="Requested loan amount in INR"
    )
    eligible_collateral_value_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Net eligible collateral value in INR"
    )


class LTVResult(BaseModel):
    requested_loan_amount_inr: Decimal
    eligible_collateral_value_inr: Decimal
    ltv_ratio: Decimal  # 0.0000 - 1.0000+
    ltv_percentage: Decimal  # 0.00% - 100.00%+
    is_unsecured: bool
    coverage_status: str  # fully_secured | partially_secured | unsecured
    collateral_shortfall_inr: Decimal


def calculate_ltv(ltv_input: LTVInput) -> LTVResult:
    """Calculate Loan-to-Value (LTV) ratio and collateral coverage metrics."""
    loan = ltv_input.requested_loan_amount_inr.quantize(Decimal("0.01"))
    collateral = ltv_input.eligible_collateral_value_inr.quantize(Decimal("0.01"))

    if loan == Decimal("0.00"):
        return LTVResult(
            requested_loan_amount_inr=Decimal("0.00"),
            eligible_collateral_value_inr=collateral,
            ltv_ratio=Decimal("0.0000"),
            ltv_percentage=Decimal("0.00"),
            is_unsecured=collateral == Decimal("0.00"),
            coverage_status="fully_secured" if collateral > 0 else "unsecured",
            collateral_shortfall_inr=Decimal("0.00"),
        )

    if collateral == Decimal("0.00"):
        return LTVResult(
            requested_loan_amount_inr=loan,
            eligible_collateral_value_inr=Decimal("0.00"),
            ltv_ratio=Decimal("99.9999"),
            ltv_percentage=Decimal("9999.99"),
            is_unsecured=True,
            coverage_status="unsecured",
            collateral_shortfall_inr=loan,
        )

    ltv_ratio = (loan / collateral).quantize(Decimal("0.0001"))
    ltv_percentage = (ltv_ratio * Decimal("100.00")).quantize(Decimal("0.01"))
    shortfall = max(Decimal("0.00"), loan - collateral).quantize(Decimal("0.01"))

    if ltv_percentage <= Decimal("100.00"):
        coverage_status = "fully_secured"
    else:
        coverage_status = "partially_secured"

    return LTVResult(
        requested_loan_amount_inr=loan,
        eligible_collateral_value_inr=collateral,
        ltv_ratio=ltv_ratio,
        ltv_percentage=ltv_percentage,
        is_unsecured=False,
        coverage_status=coverage_status,
        collateral_shortfall_inr=shortfall,
    )
