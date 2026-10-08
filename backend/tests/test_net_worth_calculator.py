"""Unit tests for Net Worth Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.asset import AssetType
from app.models.liability import LiabilityType
from app.services.net_worth_calculator import (
    AssetSummaryItem,
    LiabilitySummaryItem,
    NetWorthCalculationInput,
    calculate_net_worth,
)


def test_calculate_net_worth_positive() -> None:
    assets = [
        AssetSummaryItem(
            asset_type=AssetType.PROPERTY,
            description="Flat in Pune",
            estimated_value_inr=Decimal("8000000.00"),
            is_liquid=False,
        ),
        AssetSummaryItem(
            asset_type=AssetType.MUTUAL_FUNDS,
            description="Equity mutual funds",
            estimated_value_inr=Decimal("1500000.00"),
            is_liquid=True,
        ),
        AssetSummaryItem(
            asset_type=AssetType.SAVINGS_DEPOSIT,
            description="Bank savings",
            estimated_value_inr=Decimal("500000.00"),
            is_liquid=True,
        ),
    ]

    liabilities = [
        LiabilitySummaryItem(
            liability_type=LiabilityType.HOME_LOAN,
            lender_name="HDFC Bank",
            outstanding_amount_inr=Decimal("3000000.00"),
            monthly_emi_inr=Decimal("32000.00"),
        ),
        LiabilitySummaryItem(
            liability_type=LiabilityType.VEHICLE_LOAN,
            lender_name="ICICI Bank",
            outstanding_amount_inr=Decimal("400000.00"),
            monthly_emi_inr=Decimal("12000.00"),
        ),
    ]

    input_data = NetWorthCalculationInput(assets=assets, liabilities=liabilities)
    result = calculate_net_worth(input_data)

    # Assets: 8M + 1.5M + 0.5M = 10M
    # Liquid: 1.5M + 0.5M = 2M; Non-liquid: 8M
    # Liabilities: 3M + 0.4M = 3.4M; EMI: 32k + 12k = 44k
    # Net worth: 10M - 3.4M = 6.6M
    # Debt-to-asset: 3.4 / 10 = 0.3400
    assert result.total_assets_inr == Decimal("10000000.00")
    assert result.total_liquid_assets_inr == Decimal("2000000.00")
    assert result.total_non_liquid_assets_inr == Decimal("8000000.00")
    assert result.total_liabilities_inr == Decimal("3400000.00")
    assert result.total_monthly_emi_inr == Decimal("44000.00")
    assert result.net_worth_inr == Decimal("6600000.00")
    assert result.is_solvent is True
    assert result.debt_to_asset_ratio == Decimal("0.3400")
    assert result.asset_breakdown_inr["property"] == Decimal("8000000.00")
    assert result.liability_breakdown_inr["home_loan"] == Decimal("3000000.00")


def test_calculate_net_worth_insolvent() -> None:
    assets = [
        AssetSummaryItem(
            asset_type=AssetType.SAVINGS_DEPOSIT,
            estimated_value_inr=Decimal("100000.00"),
            is_liquid=True,
        )
    ]
    liabilities = [
        LiabilitySummaryItem(
            liability_type=LiabilityType.PERSONAL_LOAN,
            outstanding_amount_inr=Decimal("500000.00"),
            monthly_emi_inr=Decimal("15000.00"),
        )
    ]
    result = calculate_net_worth(NetWorthCalculationInput(assets=assets, liabilities=liabilities))
    assert result.net_worth_inr == Decimal("-400000.00")
    assert result.is_solvent is False


def test_calculate_net_worth_empty() -> None:
    result = calculate_net_worth(NetWorthCalculationInput(assets=[], liabilities=[]))
    assert result.total_assets_inr == Decimal("0.00")
    assert result.total_liabilities_inr == Decimal("0.00")
    assert result.net_worth_inr == Decimal("0.00")
    assert result.is_solvent is True
    assert result.debt_to_asset_ratio == Decimal("0.0000")


def test_net_worth_validation() -> None:
    with pytest.raises(ValidationError):
        AssetSummaryItem(
            asset_type=AssetType.GOLD,
            estimated_value_inr=Decimal("-50.00"),
        )

    with pytest.raises(ValidationError):
        LiabilitySummaryItem(
            liability_type=LiabilityType.OTHER,
            outstanding_amount_inr=Decimal("-100.00"),
        )
