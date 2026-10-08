"""StudyPlan Pydantic validation schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class StudyPlanBase(BaseModel):
    tuition_fee: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Tuition fee in original currency"
    )
    living_expenses: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Living expenses in original currency"
    )
    travel_expenses: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Travel expenses in original currency"
    )
    other_expenses: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Other expenses in original currency"
    )
    currency: str = Field(
        default="USD", min_length=1, max_length=10, description="Currency code (e.g. USD, EUR, GBP)"
    )
    duration_months: int = Field(
        default=24, ge=1, le=120, description="Duration of study program in months"
    )
    exchange_rate_to_inr: Decimal = Field(
        default=Decimal("83.50"),
        gt=0,
        description="Exchange rate converting original currency to INR",
    )
    total_cost_original: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total cost in original currency"
    )
    total_cost_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total cost normalized to INR"
    )


class StudyPlanCreate(StudyPlanBase):
    student_id: int = Field(..., description="Foreign key ID of the associated Student")


class StudyPlanUpdate(BaseModel):
    tuition_fee: Decimal | None = Field(None, ge=0)
    living_expenses: Decimal | None = Field(None, ge=0)
    travel_expenses: Decimal | None = Field(None, ge=0)
    other_expenses: Decimal | None = Field(None, ge=0)
    currency: str | None = Field(None, min_length=1, max_length=10)
    duration_months: int | None = Field(None, ge=1, le=120)
    exchange_rate_to_inr: Decimal | None = Field(None, gt=0)
    total_cost_original: Decimal | None = Field(None, ge=0)
    total_cost_inr: Decimal | None = Field(None, ge=0)


class StudyPlanResponse(StudyPlanBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
