"""Unit tests for Collateral Valuation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.collateral import CollateralType, OwnershipStatus
from app.services.collateral_calculator import (
    CollateralItemInput,
    calculate_collateral_value,
)


def test_calculate_collateral_value_mixed_portfolio() -> None:
    items = [
        CollateralItemInput(
            collateral_type=CollateralType.PROPERTY,
            ownership_status=OwnershipStatus.SOLE,
            description="Apartment Bangalore",
            market_value_inr=Decimal("10000000.00"),  # 1 Cr
            existing_encumbrance_inr=Decimal("2000000.00"),  # 20L encumbrance -> 80L unencumbered
        ),
        CollateralItemInput(
            collateral_type=CollateralType.FIXED_DEPOSIT,
            ownership_status=OwnershipStatus.SOLE,
            description="Fixed Deposit SBI",
            market_value_inr=Decimal("1000000.00"),  # 10L -> 0 encumbrance -> 10L unencumbered
            existing_encumbrance_inr=Decimal("0.00"),
        ),
        CollateralItemInput(
            collateral_type=CollateralType.GOLD,
            ownership_status=OwnershipStatus.JOINT_PARENT,
            description="Gold Bullion",
            market_value_inr=Decimal("800000.00"),  # 8L -> 8L unencumbered
            existing_encumbrance_inr=Decimal("0.00"),
        ),
    ]

    result = calculate_collateral_value(items)

    # Market: 10M + 1M + 0.8M = 11.8M
    # Encumbrance: 2M
    # Unencumbered: 8M + 1M + 0.8M = 9.8M
    # Eligible:
    # Property: 8M * 0.80 * 1.0 = 6.4M
    # FD: 1M * 0.90 * 1.0 = 0.9M
    # Gold: 0.8M * 0.75 * 1.0 = 0.6M
    # Total eligible: 6.4M + 0.9M + 0.6M = 7.9M
    assert result.total_market_value_inr == Decimal("11800000.00")
    assert result.total_encumbrance_inr == Decimal("2000000.00")
    assert result.total_unencumbered_value_inr == Decimal("9800000.00")
    assert result.total_eligible_value_inr == Decimal("7900000.00")
    assert result.breakdown_by_type_inr["property"] == Decimal("6400000.00")
    assert result.breakdown_by_type_inr["fixed_deposit"] == Decimal("900000.00")
    assert result.breakdown_by_type_inr["gold"] == Decimal("600000.00")


def test_calculate_collateral_partial_ownership() -> None:
    items = [
        CollateralItemInput(
            collateral_type=CollateralType.PROPERTY,
            ownership_status=OwnershipStatus.JOINT_THIRD_PARTY,  # 50% factor
            market_value_inr=Decimal("6000000.00"),
            existing_encumbrance_inr=Decimal("0.00"),
        )
    ]
    result = calculate_collateral_value(items)
    # 6M * 0.80 (haircut) * 0.50 (ownership) = 2.4M
    assert result.total_eligible_value_inr == Decimal("2400000.00")


def test_collateral_validation() -> None:
    with pytest.raises(ValidationError):
        CollateralItemInput(
            market_value_inr=Decimal("-100.00"),
        )
