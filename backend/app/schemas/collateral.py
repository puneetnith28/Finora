"""Pydantic schemas for Collateral."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.collateral import CollateralType, OwnershipStatus


class CollateralBase(BaseModel):
    asset_id: int | None = Field(
        default=None, description="Optional link to an existing Asset record"
    )
    collateral_type: CollateralType = Field(
        default=CollateralType.PROPERTY, description="Category of collateral"
    )
    ownership_status: OwnershipStatus = Field(
        default=OwnershipStatus.SOLE, description="Ownership state of the collateral asset"
    )
    description: str | None = Field(
        default=None, max_length=255, description="Description or property details"
    )
    market_value_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Estimated total market value in INR"
    )
    existing_encumbrance_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Existing loans or mortgages on this collateral"
    )
    eligible_value_inr: Decimal = Field(
        default=Decimal("0.0"),
        ge=0,
        description="Calculated net eligible value considered for loan collateral",
    )


class CollateralCreate(CollateralBase):
    pass


class CollateralUpdate(BaseModel):
    asset_id: int | None = None
    collateral_type: CollateralType | None = None
    ownership_status: OwnershipStatus | None = None
    description: str | None = Field(default=None, max_length=255)
    market_value_inr: Decimal | None = Field(default=None, ge=0)
    existing_encumbrance_inr: Decimal | None = Field(default=None, ge=0)
    eligible_value_inr: Decimal | None = Field(default=None, ge=0)


class CollateralRead(CollateralBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


CollateralResponse = CollateralRead
