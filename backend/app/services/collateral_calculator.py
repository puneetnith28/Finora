"""Deterministic Collateral Valuation and Eligibility Service."""

from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.collateral import CollateralType, OwnershipStatus

# Standard prudential lending haircut/eligibility factors by asset type
COLLATERAL_HAIRCUT_FACTORS: dict[str, Decimal] = {
    CollateralType.PROPERTY.value: Decimal("0.80"),  # Up to 80% of market value
    CollateralType.FIXED_DEPOSIT.value: Decimal("0.90"),  # Up to 90%
    CollateralType.GOLD.value: Decimal("0.75"),  # Up to 75%
    CollateralType.GOVERNMENT_BONDS.value: Decimal("0.85"),  # Up to 85%
    CollateralType.INSURANCE_POLICY.value: Decimal("0.80"),  # Up to 80% of surrender value
    CollateralType.OTHER.value: Decimal("0.50"),  # Up to 50%
}

# Ownership eligibility factor
OWNERSHIP_ELIGIBILITY_FACTORS: dict[str, Decimal] = {
    OwnershipStatus.SOLE.value: Decimal("1.00"),
    OwnershipStatus.JOINT_PARENT.value: Decimal("1.00"),
    OwnershipStatus.JOINT_THIRD_PARTY.value: Decimal("0.50"),
    OwnershipStatus.THIRD_PARTY.value: Decimal("0.70"),
}


class CollateralItemInput(BaseModel):
    collateral_type: CollateralType = Field(default=CollateralType.PROPERTY)
    ownership_status: OwnershipStatus = Field(default=OwnershipStatus.SOLE)
    description: str | None = None
    market_value_inr: Decimal = Field(..., ge=0, description="Gross market value in INR")
    existing_encumbrance_inr: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Existing mortgages/liens in INR"
    )
    custom_haircut_factor: Decimal | None = Field(
        default=None, ge=0, le=1, description="Optional haircut factor override"
    )


class CollateralValuationItemResult(BaseModel):
    collateral_type: str
    ownership_status: str
    description: str | None
    market_value_inr: Decimal
    existing_encumbrance_inr: Decimal
    unencumbered_value_inr: Decimal
    haircut_factor: Decimal
    ownership_factor: Decimal
    eligible_value_inr: Decimal


class CollateralValuationResult(BaseModel):
    total_market_value_inr: Decimal
    total_encumbrance_inr: Decimal
    total_unencumbered_value_inr: Decimal
    total_eligible_value_inr: Decimal
    breakdown_by_type_inr: dict[str, Decimal]
    items: list[CollateralValuationItemResult]


def calculate_collateral_value(
    collaterals: list[CollateralItemInput],
) -> CollateralValuationResult:
    """Calculate eligible collateral value applying encumbrance deductions, haircuts, and ownership factors."""
    total_market = Decimal("0.00")
    total_encumbrance = Decimal("0.00")
    total_unencumbered = Decimal("0.00")
    total_eligible = Decimal("0.00")

    breakdown: dict[str, Decimal] = {c_type.value: Decimal("0.00") for c_type in CollateralType}
    item_results: list[CollateralValuationItemResult] = []

    for item in collaterals:
        market_val = item.market_value_inr.quantize(Decimal("0.01"))
        encumbrance = item.existing_encumbrance_inr.quantize(Decimal("0.01"))
        unencumbered = max(Decimal("0.00"), market_val - encumbrance).quantize(Decimal("0.01"))

        if item.custom_haircut_factor is not None:
            haircut = item.custom_haircut_factor
        else:
            haircut = COLLATERAL_HAIRCUT_FACTORS.get(item.collateral_type.value, Decimal("0.70"))

        ownership_fac = OWNERSHIP_ELIGIBILITY_FACTORS.get(
            item.ownership_status.value, Decimal("0.70")
        )

        eligible = (unencumbered * haircut * ownership_fac).quantize(Decimal("0.01"))

        total_market += market_val
        total_encumbrance += encumbrance
        total_unencumbered += unencumbered
        total_eligible += eligible
        breakdown[item.collateral_type.value] = (
            breakdown[item.collateral_type.value] + eligible
        ).quantize(Decimal("0.01"))

        item_results.append(
            CollateralValuationItemResult(
                collateral_type=item.collateral_type.value,
                ownership_status=item.ownership_status.value,
                description=item.description,
                market_value_inr=market_val,
                existing_encumbrance_inr=encumbrance,
                unencumbered_value_inr=unencumbered,
                haircut_factor=haircut,
                ownership_factor=ownership_fac,
                eligible_value_inr=eligible,
            )
        )

    return CollateralValuationResult(
        total_market_value_inr=total_market.quantize(Decimal("0.01")),
        total_encumbrance_inr=total_encumbrance.quantize(Decimal("0.01")),
        total_unencumbered_value_inr=total_unencumbered.quantize(Decimal("0.01")),
        total_eligible_value_inr=total_eligible.quantize(Decimal("0.01")),
        breakdown_by_type_inr=breakdown,
        items=item_results,
    )
