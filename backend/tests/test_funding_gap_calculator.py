"""Unit tests for Funding Gap Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.services.funding_gap_calculator import (
    FundingGapInput,
    calculate_funding_gap,
)


def test_calculate_funding_gap_with_deficit() -> None:
    gap_input = FundingGapInput(
        total_study_cost_inr=Decimal("5000000.00"),
        available_funding_inr=Decimal("1500000.00"),
    )
    result = calculate_funding_gap(gap_input)

    assert result.has_gap is True
    assert result.funding_gap_inr == Decimal("3500000.00")
    assert result.surplus_funding_inr == Decimal("0.00")
    assert result.coverage_ratio == Decimal("0.3000")
    assert result.recommended_loan_amount_inr == Decimal("3500000.00")


def test_calculate_funding_gap_with_surplus() -> None:
    gap_input = FundingGapInput(
        total_study_cost_inr=Decimal("3000000.00"),
        available_funding_inr=Decimal("3500000.00"),
    )
    result = calculate_funding_gap(gap_input)

    assert result.has_gap is False
    assert result.funding_gap_inr == Decimal("0.00")
    assert result.surplus_funding_inr == Decimal("500000.00")
    assert result.coverage_ratio == Decimal("1.1667")
    assert result.recommended_loan_amount_inr == Decimal("0.00")


def test_calculate_funding_gap_exact_match() -> None:
    gap_input = FundingGapInput(
        total_study_cost_inr=Decimal("4000000.00"),
        available_funding_inr=Decimal("4000000.00"),
    )
    result = calculate_funding_gap(gap_input)

    assert result.has_gap is False
    assert result.funding_gap_inr == Decimal("0.00")
    assert result.surplus_funding_inr == Decimal("0.00")
    assert result.coverage_ratio == Decimal("1.0000")


def test_funding_gap_validation() -> None:
    with pytest.raises(ValidationError):
        FundingGapInput(
            total_study_cost_inr=Decimal("-100.00"),
            available_funding_inr=Decimal("500.00"),
        )
