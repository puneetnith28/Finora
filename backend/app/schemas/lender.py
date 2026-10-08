"""Pydantic schemas for Lender and LenderCriterion."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.lender import CriterionOperator, CriterionType


class LenderCriterionBase(BaseModel):
    criterion_type: CriterionType = Field(
        default=CriterionType.MIN_CIBIL, description="Category of underwriting rule"
    )
    operator: CriterionOperator = Field(
        default=CriterionOperator.GTE, description="Comparison operator"
    )
    threshold_value: Decimal | None = Field(
        default=None, description="Numeric threshold value if applicable"
    )
    threshold_text: str | None = Field(
        default=None, max_length=255, description="Textual threshold value if applicable"
    )
    required: bool = Field(default=True, description="Whether this criterion is a hard requirement")
    weight: Decimal = Field(default=Decimal("1.00"), ge=0, description="Weight factor for scoring")
    configuration_json: str | None = Field(
        default=None, description="Optional JSON configuration for complex rule logic"
    )


class LenderCriterionCreate(LenderCriterionBase):
    lender_id: int | None = None


class LenderCriterionUpdate(BaseModel):
    criterion_type: CriterionType | None = None
    operator: CriterionOperator | None = None
    threshold_value: Decimal | None = None
    threshold_text: str | None = None
    required: bool | None = None
    weight: Decimal | None = None
    configuration_json: str | None = None


class LenderCriterionResponse(LenderCriterionBase):
    id: int
    lender_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LenderBase(BaseModel):
    name: str = Field(..., max_length=150, description="Lender institution name")
    description: str | None = Field(default=None, description="Lender description and policies")
    active: bool = Field(default=True, description="Whether lender is currently active")


class LenderCreate(LenderBase):
    criteria: list[LenderCriterionBase] = Field(
        default_factory=list, description="Initial underwriting criteria"
    )


class LenderUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=150)
    description: str | None = None
    active: bool | None = None


class LenderResponse(LenderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    criteria: list[LenderCriterionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


LenderRead = LenderResponse
LenderCriterionRead = LenderCriterionResponse
