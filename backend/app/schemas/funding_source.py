"""FundingSource Pydantic validation schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.funding_source import FundingSourceType


class FundingSourceBase(BaseModel):
    source_type: FundingSourceType = Field(..., description="Type of funding source")
    amount_original: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Amount in original currency"
    )
    currency: str = Field(
        default="INR", min_length=1, max_length=10, description="Currency code (e.g. INR, USD)"
    )
    exchange_rate_to_inr: Decimal = Field(
        default=Decimal("1.00"), gt=0, description="Exchange rate to convert to INR"
    )
    amount_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Calculated amount in INR"
    )
    verified: bool = Field(
        default=False, description="Whether this funding source has been document-verified"
    )


class FundingSourceCreate(FundingSourceBase):
    student_id: int = Field(..., description="Foreign key ID of the associated Student")


class FundingSourceUpdate(BaseModel):
    source_type: FundingSourceType | None = None
    amount_original: Decimal | None = Field(None, ge=0)
    currency: str | None = Field(None, min_length=1, max_length=10)
    exchange_rate_to_inr: Decimal | None = Field(None, gt=0)
    amount_inr: Decimal | None = Field(None, ge=0)
    verified: bool | None = None


class FundingSourceResponse(FundingSourceBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
