"""Deterministic Equated Monthly Installment (EMI) Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field


class EMIInput(BaseModel):
    principal_inr: Decimal = Field(..., ge=0, description="Principal loan amount in INR")
    annual_interest_rate_percent: Decimal = Field(
        ..., ge=0, le=100, description="Annual interest rate percentage (e.g. 10.5 for 10.5%)"
    )
    tenure_months: int = Field(..., ge=1, le=480, description="Loan tenure in months (1-480)")


class AmortizationYear(BaseModel):
    year: int
    opening_balance_inr: Decimal
    principal_paid_inr: Decimal
    interest_paid_inr: Decimal
    closing_balance_inr: Decimal


class EMIResult(BaseModel):
    principal_inr: Decimal
    annual_interest_rate_percent: Decimal
    tenure_months: int
    monthly_emi_inr: Decimal
    total_interest_inr: Decimal
    total_repayment_inr: Decimal
    interest_to_principal_ratio: Decimal
    amortization_schedule: list[AmortizationYear] = Field(default_factory=list)


def calculate_emi(emi_input: EMIInput) -> EMIResult:
    """Calculate monthly EMI, total interest, total repayment, and annual amortization schedule.

    Formula:
      If r == 0:
        EMI = P / n
      Else:
        r = annual_interest_rate_percent / 100 / 12
        EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    """
    p = float(emi_input.principal_inr)
    n = emi_input.tenure_months
    annual_rate = float(emi_input.annual_interest_rate_percent)

    if p == 0.0:
        return EMIResult(
            principal_inr=Decimal("0.00"),
            annual_interest_rate_percent=emi_input.annual_interest_rate_percent,
            tenure_months=n,
            monthly_emi_inr=Decimal("0.00"),
            total_interest_inr=Decimal("0.00"),
            total_repayment_inr=Decimal("0.00"),
            interest_to_principal_ratio=Decimal("0.0000"),
            amortization_schedule=[],
        )

    if annual_rate == 0.0:
        monthly_emi = p / n
    else:
        monthly_r = (annual_rate / 100.0) / 12.0
        pow_term = (1.0 + monthly_r) ** n
        monthly_emi = (p * monthly_r * pow_term) / (pow_term - 1.0)

    emi_decimal = Decimal(f"{monthly_emi:.2f}")
    total_repayment = (emi_decimal * Decimal(n)).quantize(Decimal("0.01"))
    total_interest = (total_repayment - emi_input.principal_inr).quantize(Decimal("0.01"))
    ratio = (total_interest / emi_input.principal_inr).quantize(Decimal("0.0001"))

    # Generate yearly amortization schedule
    schedule: list[AmortizationYear] = []
    balance = p
    monthly_r = (annual_rate / 100.0) / 12.0 if annual_rate > 0 else 0.0

    current_year = 1
    yearly_principal = 0.0
    yearly_interest = 0.0
    opening_for_year = balance

    for month in range(1, n + 1):
        interest_m = balance * monthly_r
        principal_m = float(emi_decimal) - interest_m
        if principal_m > balance or month == n:
            principal_m = balance
            interest_m = max(0.0, float(emi_decimal) - principal_m)
            balance = 0.0
        else:
            balance -= principal_m

        yearly_principal += principal_m
        yearly_interest += interest_m

        if month % 12 == 0 or month == n:
            schedule.append(
                AmortizationYear(
                    year=current_year,
                    opening_balance_inr=Decimal(f"{opening_for_year:.2f}"),
                    principal_paid_inr=Decimal(f"{yearly_principal:.2f}"),
                    interest_paid_inr=Decimal(f"{yearly_interest:.2f}"),
                    closing_balance_inr=Decimal(f"{balance:.2f}"),
                )
            )
            current_year += 1
            yearly_principal = 0.0
            yearly_interest = 0.0
            opening_for_year = balance

    return EMIResult(
        principal_inr=emi_input.principal_inr.quantize(Decimal("0.01")),
        annual_interest_rate_percent=emi_input.annual_interest_rate_percent,
        tenure_months=n,
        monthly_emi_inr=emi_decimal,
        total_interest_inr=total_interest,
        total_repayment_inr=total_repayment,
        interest_to_principal_ratio=ratio,
        amortization_schedule=schedule,
    )
