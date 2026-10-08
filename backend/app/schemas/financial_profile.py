"""FinancialProfile Pydantic validation schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FinancialProfileBase(BaseModel):
    monthly_income: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Monthly household / student income in INR"
    )
    existing_monthly_obligations: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Existing monthly debt obligations/EMIs in INR"
    )
    monthly_living_expenses: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Estimated monthly living expenses in INR"
    )
    requested_loan_amount: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Requested education loan amount in INR"
    )
    loan_tenure_months: int = Field(
        default=120, ge=12, le=360, description="Loan tenure in months (e.g. 120)"
    )
    loan_interest_rate: Decimal = Field(
        default=Decimal("10.50"),
        gt=0,
        le=100,
        description="Annual interest rate percentage (e.g. 10.50)",
    )
    proposed_emi: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Calculated proposed monthly EMI in INR"
    )
    foir: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Calculated Fixed Obligation to Income Ratio"
    )
    total_assets_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total declared assets in INR"
    )
    total_liabilities_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total declared liabilities in INR"
    )
    net_worth_inr: Decimal = Field(
        default=Decimal("0.0"), description="Calculated net worth in INR"
    )


class FinancialProfileCreate(FinancialProfileBase):
    student_id: int = Field(..., description="Foreign key ID of the associated Student")


class FinancialProfileUpdate(BaseModel):
    monthly_income: Decimal | None = Field(None, ge=0)
    existing_monthly_obligations: Decimal | None = Field(None, ge=0)
    monthly_living_expenses: Decimal | None = Field(None, ge=0)
    requested_loan_amount: Decimal | None = Field(None, ge=0)
    loan_tenure_months: int | None = Field(None, ge=12, le=360)
    loan_interest_rate: Decimal | None = Field(None, gt=0, le=100)
    proposed_emi: Decimal | None = Field(None, ge=0)
    foir: Decimal | None = Field(None, ge=0)
    total_assets_inr: Decimal | None = Field(None, ge=0)
    total_liabilities_inr: Decimal | None = Field(None, ge=0)
    net_worth_inr: Decimal | None = None


class FinancialProfileResponse(FinancialProfileBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
