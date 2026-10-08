"""Unit tests for Funding Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.funding_source import FundingSourceType
from app.services.funding_calculator import (
    FundingItem,
    calculate_available_funding,
)


def test_calculate_available_funding_mixed_currencies() -> None:
    items = [
        FundingItem(
            funding_type=FundingSourceType.SAVINGS,
            source_name="SBI Savings Deposit",
            amount=Decimal("500000.00"),
            currency="INR",
        ),
        FundingItem(
            funding_type=FundingSourceType.SCHOLARSHIP,
            source_name="University Merit Fellowship",
            amount=Decimal("10000.00"),
            currency="USD",
            exchange_rate=Decimal("85.00"),
        ),
        FundingItem(
            funding_type=FundingSourceType.FAMILY_CONTRIBUTION,
            source_name="Parents Contribution",
            amount=Decimal("1000000.00"),
            currency="INR",
        ),
        FundingItem(
            funding_type=FundingSourceType.FEES_PAID,
            source_name="Admission Deposit Paid",
            amount=Decimal("1500.00"),
            currency="USD",
            exchange_rate=Decimal("85.00"),
        ),
    ]

    result = calculate_available_funding(items)

    # 500,000 + (10,000 * 85 = 850,000) + 1,000,000 + (1,500 * 85 = 127,500) = 2,477,500
    assert result.total_funding_inr == Decimal("2477500.00")
    assert result.breakdown_by_type_inr["savings"] == Decimal("500000.00")
    assert result.breakdown_by_type_inr["scholarship"] == Decimal("850000.00")
    assert result.breakdown_by_type_inr["family_contribution"] == Decimal("1000000.00")
    assert result.breakdown_by_type_inr["fees_paid"] == Decimal("127500.00")

    assert len(result.items_inr) == 4


def test_calculate_available_funding_empty() -> None:
    result = calculate_available_funding([])
    assert result.total_funding_inr == Decimal("0.00")
    assert result.breakdown_by_type_inr["savings"] == Decimal("0.00")


def test_funding_item_validation() -> None:
    with pytest.raises(ValidationError):
        FundingItem(amount=Decimal("-500.00"))
