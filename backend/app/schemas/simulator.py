"""Schemas for the interactive loan & FOIR simulator."""

from decimal import Decimal

from pydantic import BaseModel, Field


class FoirSimulatorRequest(BaseModel):
    loan_amount_inr: Decimal = Field(..., ge=0, description="Simulated loan principal amount in INR")
    annual_interest_rate_percent: Decimal = Field(..., ge=0, le=100, description="Annual interest rate percentage")
    tenure_months: int = Field(..., ge=1, le=360, description="Repayment tenure in months")
    monthly_net_income_inr: Decimal = Field(..., ge=0, description="Total monthly net household/co-borrower income in INR")
    existing_monthly_obligations_inr: Decimal = Field(default=Decimal("0.0"), ge=0, description="Existing ongoing monthly loan EMIs in INR")


class FoirSimulatorResponse(BaseModel):
    loan_amount_inr: Decimal
    annual_interest_rate_percent: Decimal
    tenure_months: int
    monthly_income_inr: Decimal
    existing_obligations_inr: Decimal
    simulated_emi_inr: Decimal
    total_monthly_obligations_inr: Decimal
    foir_ratio: Decimal
    foir_percentage: float
    status_badge: str  # Safe (<= 40%), Moderate (41-50%), Stretched (51-60%), High Risk (> 60%)
    max_affordable_emi_inr: Decimal
    remedial_suggestions: list[str]
