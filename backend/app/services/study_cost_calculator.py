"""Deterministic Study-Cost Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field


class StudyCostBreakdown(BaseModel):
    tuition_fee: Decimal = Field(default=Decimal("0.0"), ge=0)
    living_expense: Decimal = Field(default=Decimal("0.0"), ge=0)
    travel_expense: Decimal = Field(default=Decimal("0.0"), ge=0)
    insurance_expense: Decimal = Field(default=Decimal("0.0"), ge=0)
    other_expense: Decimal = Field(default=Decimal("0.0"), ge=0)
    duration_months: int = Field(default=12, ge=1)
    currency: str = Field(default="USD")
    exchange_rate: Decimal = Field(default=Decimal("85.00"), gt=0)


class StudyCostResult(BaseModel):
    total_cost_original_currency: Decimal
    total_cost_inr: Decimal
    currency: str
    exchange_rate: Decimal
    duration_months: int
    annualized_cost_original_currency: Decimal
    annualized_cost_inr: Decimal
    breakdown_inr: dict[str, Decimal]


def calculate_study_cost(breakdown: StudyCostBreakdown) -> StudyCostResult:
    """Calculate total and annualized study cost in original currency and INR.

    Formula:
      total_cost = tuition + living + travel + insurance + other_expense
      total_cost_inr = total_cost * exchange_rate
      annualized = total_cost * (12 / duration_months)
    """
    total_original = (
        breakdown.tuition_fee
        + breakdown.living_expense
        + breakdown.travel_expense
        + breakdown.insurance_expense
        + breakdown.other_expense
    )

    total_inr = (total_original * breakdown.exchange_rate).quantize(Decimal("0.01"))

    # Multi-year annualization
    duration_years = Decimal(breakdown.duration_months) / Decimal("12")
    if duration_years > 0:
        annual_original = (total_original / duration_years).quantize(Decimal("0.01"))
        annual_inr = (total_inr / duration_years).quantize(Decimal("0.01"))
    else:
        annual_original = total_original
        annual_inr = total_inr

    breakdown_inr = {
        "tuition_fee": (breakdown.tuition_fee * breakdown.exchange_rate).quantize(Decimal("0.01")),
        "living_expense": (breakdown.living_expense * breakdown.exchange_rate).quantize(
            Decimal("0.01")
        ),
        "travel_expense": (breakdown.travel_expense * breakdown.exchange_rate).quantize(
            Decimal("0.01")
        ),
        "insurance_expense": (breakdown.insurance_expense * breakdown.exchange_rate).quantize(
            Decimal("0.01")
        ),
        "other_expense": (breakdown.other_expense * breakdown.exchange_rate).quantize(
            Decimal("0.01")
        ),
    }

    return StudyCostResult(
        total_cost_original_currency=total_original.quantize(Decimal("0.01")),
        total_cost_inr=total_inr,
        currency=breakdown.currency,
        exchange_rate=breakdown.exchange_rate,
        duration_months=breakdown.duration_months,
        annualized_cost_original_currency=annual_original,
        annualized_cost_inr=annual_inr,
        breakdown_inr=breakdown_inr,
    )
