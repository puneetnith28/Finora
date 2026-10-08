"""Deterministic FOIR (Fixed Obligation to Income Ratio) Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field


class FOIRInput(BaseModel):
    monthly_net_income_inr: Decimal = Field(
        ..., ge=0, description="Monthly net take-home income in INR"
    )
    existing_monthly_emi_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Sum of existing monthly EMI obligations"
    )
    proposed_monthly_emi_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Estimated proposed education loan EMI"
    )
    other_monthly_obligations_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Any other fixed monthly debt obligations"
    )


class FOIRResult(BaseModel):
    monthly_net_income_inr: Decimal
    total_monthly_obligations_inr: Decimal
    foir_ratio: Decimal  # 0.0000 - 1.0000+
    foir_percentage: Decimal  # 0.00% - 100.00%+
    disposable_income_inr: Decimal
    is_affordable: bool
    risk_category: str


def calculate_foir(foir_input: FOIRInput) -> FOIRResult:
    """Calculate Fixed Obligation to Income Ratio (FOIR).

    Formula:
      total_obligations = existing_emi + proposed_emi + other_obligations
      foir_ratio = total_obligations / monthly_net_income
      foir_percentage = foir_ratio * 100
      disposable_income = monthly_net_income - total_obligations
    """
    income = foir_input.monthly_net_income_inr.quantize(Decimal("0.01"))
    total_obligations = (
        foir_input.existing_monthly_emi_inr
        + foir_input.proposed_monthly_emi_inr
        + foir_input.other_monthly_obligations_inr
    ).quantize(Decimal("0.01"))

    disposable_income = (income - total_obligations).quantize(Decimal("0.01"))

    if income > Decimal("0.00"):
        foir_ratio = (total_obligations / income).quantize(Decimal("0.0001"))
        foir_percentage = (foir_ratio * Decimal("100.00")).quantize(Decimal("0.01"))
    else:
        foir_ratio = Decimal("1.0000") if total_obligations > Decimal("0.00") else Decimal("0.0000")
        foir_percentage = (
            Decimal("100.00") if total_obligations > Decimal("0.00") else Decimal("0.00")
        )

    if foir_percentage <= Decimal("40.00"):
        risk_category = "low_risk"
    elif foir_percentage <= Decimal("60.00"):
        risk_category = "moderate_risk"
    elif foir_percentage <= Decimal("80.00"):
        risk_category = "high_risk"
    else:
        risk_category = "critical_risk"

    is_affordable = disposable_income > Decimal("0.00") and foir_percentage <= Decimal("70.00")

    return FOIRResult(
        monthly_net_income_inr=income,
        total_monthly_obligations_inr=total_obligations,
        foir_ratio=foir_ratio,
        foir_percentage=foir_percentage,
        disposable_income_inr=disposable_income,
        is_affordable=is_affordable,
        risk_category=risk_category,
    )
