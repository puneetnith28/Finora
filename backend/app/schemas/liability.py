"""Liability Pydantic validation schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.liability import LiabilityType


class LiabilityBase(BaseModel):
    liability_type: LiabilityType = Field(
        ..., description="Category of liability (e.g. home_loan, personal_loan, credit_card)"
    )
    lender_name: str | None = Field(None, max_length=150, description="Name of the creditor/bank")
    outstanding_amount_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total outstanding principal amount in INR"
    )
    monthly_emi_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Current monthly EMI obligation in INR"
    )


class LiabilityCreate(LiabilityBase):
    student_id: int = Field(..., description="Foreign key ID of the associated Student")


class LiabilityUpdate(BaseModel):
    liability_type: LiabilityType | None = None
    lender_name: str | None = Field(None, max_length=150)
    outstanding_amount_inr: Decimal | None = Field(None, ge=0)
    monthly_emi_inr: Decimal | None = Field(None, ge=0)


class LiabilityResponse(LiabilityBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
