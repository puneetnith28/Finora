"""Asset Pydantic validation schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.asset import AssetType


class AssetBase(BaseModel):
    asset_type: AssetType = Field(
        ..., description="Category of asset (e.g. savings_deposit, property, gold)"
    )
    description: str | None = Field(
        None, max_length=255, description="Brief description / identifier of asset"
    )
    estimated_value_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Estimated asset value in INR"
    )
    is_liquid: bool = Field(
        default=False, description="Whether asset can be readily converted to cash"
    )


class AssetCreate(AssetBase):
    student_id: int = Field(..., description="Foreign key ID of the associated Student")


class AssetUpdate(BaseModel):
    asset_type: AssetType | None = None
    description: str | None = Field(None, max_length=255)
    estimated_value_inr: Decimal | None = Field(None, ge=0)
    is_liquid: bool | None = None


class AssetResponse(AssetBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
