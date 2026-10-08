"""Unit tests for Study-Cost Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.services.study_cost_calculator import (
    StudyCostBreakdown,
    calculate_study_cost,
)


def test_study_cost_single_year() -> None:
    breakdown = StudyCostBreakdown(
        tuition_fee=Decimal("40000.00"),
        living_expense=Decimal("15000.00"),
        travel_expense=Decimal("2000.00"),
        insurance_expense=Decimal("1500.00"),
        other_expense=Decimal("1500.00"),
        duration_months=12,
        currency="USD",
        exchange_rate=Decimal("85.00"),
    )
    result = calculate_study_cost(breakdown)

    assert result.total_cost_original_currency == Decimal("60000.00")
    assert result.total_cost_inr == Decimal("5100000.00")  # 60,000 * 85
    assert result.annualized_cost_original_currency == Decimal("60000.00")
    assert result.annualized_cost_inr == Decimal("5100000.00")
    assert result.breakdown_inr["tuition_fee"] == Decimal("3400000.00")
    assert result.breakdown_inr["living_expense"] == Decimal("1275000.00")


def test_study_cost_multi_year() -> None:
    # 2-year program (24 months)
    breakdown = StudyCostBreakdown(
        tuition_fee=Decimal("80000.00"),
        living_expense=Decimal("30000.00"),
        travel_expense=Decimal("4000.00"),
        insurance_expense=Decimal("3000.00"),
        other_expense=Decimal("3000.00"),
        duration_months=24,
        currency="USD",
        exchange_rate=Decimal("85.00"),
    )
    result = calculate_study_cost(breakdown)

    assert result.total_cost_original_currency == Decimal("120000.00")
    assert result.total_cost_inr == Decimal("10200000.00")  # 120,000 * 85
    assert result.annualized_cost_original_currency == Decimal("60000.00")
    assert result.annualized_cost_inr == Decimal("5100000.00")


def test_study_cost_validation() -> None:
    with pytest.raises(ValidationError):
        StudyCostBreakdown(
            tuition_fee=Decimal("-500.00"),
        )

    with pytest.raises(ValidationError):
        StudyCostBreakdown(
            exchange_rate=Decimal("0.00"),
        )

    with pytest.raises(ValidationError):
        StudyCostBreakdown(
            duration_months=0,
        )
