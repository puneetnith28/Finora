"""Deterministic Net Worth Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.asset import AssetType
from app.models.liability import LiabilityType


class AssetSummaryItem(BaseModel):
    asset_type: AssetType
    description: str | None = None
    estimated_value_inr: Decimal = Field(..., ge=0)
    is_liquid: bool = False


class LiabilitySummaryItem(BaseModel):
    liability_type: LiabilityType
    lender_name: str | None = None
    outstanding_amount_inr: Decimal = Field(..., ge=0)
    monthly_emi_inr: Decimal = Field(default=Decimal("0.0"), ge=0)


class NetWorthCalculationInput(BaseModel):
    assets: list[AssetSummaryItem] = Field(default_factory=list)
    liabilities: list[LiabilitySummaryItem] = Field(default_factory=list)


class NetWorthCalculationResult(BaseModel):
    total_assets_inr: Decimal
    total_liquid_assets_inr: Decimal
    total_non_liquid_assets_inr: Decimal
    total_liabilities_inr: Decimal
    total_monthly_emi_inr: Decimal
    net_worth_inr: Decimal
    is_solvent: bool
    debt_to_asset_ratio: Decimal
    asset_breakdown_inr: dict[str, Decimal]
    liability_breakdown_inr: dict[str, Decimal]


def calculate_net_worth(input_data: NetWorthCalculationInput) -> NetWorthCalculationResult:
    """Compute total assets, liabilities, net worth, liquidity breakdown, and debt-to-asset ratio."""
    total_assets = Decimal("0.00")
    liquid_assets = Decimal("0.00")
    non_liquid_assets = Decimal("0.00")
    asset_breakdown: dict[str, Decimal] = {a_type.value: Decimal("0.00") for a_type in AssetType}

    for asset in input_data.assets:
        val = asset.estimated_value_inr.quantize(Decimal("0.01"))
        total_assets += val
        if asset.is_liquid:
            liquid_assets += val
        else:
            non_liquid_assets += val
        asset_breakdown[asset.asset_type.value] = (
            asset_breakdown[asset.asset_type.value] + val
        ).quantize(Decimal("0.01"))

    total_liabilities = Decimal("0.00")
    total_emi = Decimal("0.00")
    liability_breakdown: dict[str, Decimal] = {
        l_type.value: Decimal("0.00") for l_type in LiabilityType
    }

    for liability in input_data.liabilities:
        outstanding = liability.outstanding_amount_inr.quantize(Decimal("0.01"))
        emi = liability.monthly_emi_inr.quantize(Decimal("0.01"))
        total_liabilities += outstanding
        total_emi += emi
        liability_breakdown[liability.liability_type.value] = (
            liability_breakdown[liability.liability_type.value] + outstanding
        ).quantize(Decimal("0.01"))

    net_worth = (total_assets - total_liabilities).quantize(Decimal("0.01"))
    is_solvent = net_worth >= Decimal("0.00")

    if total_assets > Decimal("0.00"):
        debt_to_asset = (total_liabilities / total_assets).quantize(Decimal("0.0001"))
    else:
        debt_to_asset = (
            Decimal("0.0000") if total_liabilities == Decimal("0.00") else Decimal("999.9999")
        )

    return NetWorthCalculationResult(
        total_assets_inr=total_assets.quantize(Decimal("0.01")),
        total_liquid_assets_inr=liquid_assets.quantize(Decimal("0.01")),
        total_non_liquid_assets_inr=non_liquid_assets.quantize(Decimal("0.01")),
        total_liabilities_inr=total_liabilities.quantize(Decimal("0.01")),
        total_monthly_emi_inr=total_emi.quantize(Decimal("0.01")),
        net_worth_inr=net_worth,
        is_solvent=is_solvent,
        debt_to_asset_ratio=debt_to_asset,
        asset_breakdown_inr=asset_breakdown,
        liability_breakdown_inr=liability_breakdown,
    )
