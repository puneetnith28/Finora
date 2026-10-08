"""Unit tests for LTV Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.services.ltv_calculator import (
    LTVInput,
    calculate_ltv,
)


def test_calculate_ltv_fully_secured() -> None:
    # Loan: 40L, Collateral: 60L -> LTV = 66.67%
    ltv_input = LTVInput(
        requested_loan_amount_inr=Decimal("4000000.00"),
        eligible_collateral_value_inr=Decimal("6000000.00"),
    )
    result = calculate_ltv(ltv_input)

    assert result.ltv_ratio == Decimal("0.6667")
    assert result.ltv_percentage == Decimal("66.67")
    assert result.is_unsecured is False
    assert result.coverage_status == "fully_secured"
    assert result.collateral_shortfall_inr == Decimal("0.00")


def test_calculate_ltv_partially_secured() -> None:
    # Loan: 50L, Collateral: 40L -> LTV = 125.00%
    ltv_input = LTVInput(
        requested_loan_amount_inr=Decimal("5000000.00"),
        eligible_collateral_value_inr=Decimal("4000000.00"),
    )
    result = calculate_ltv(ltv_input)

    assert result.ltv_ratio == Decimal("1.2500")
    assert result.ltv_percentage == Decimal("125.00")
    assert result.is_unsecured is False
    assert result.coverage_status == "partially_secured"
    assert result.collateral_shortfall_inr == Decimal("1000000.00")


def test_calculate_ltv_unsecured() -> None:
    ltv_input = LTVInput(
        requested_loan_amount_inr=Decimal("3000000.00"),
        eligible_collateral_value_inr=Decimal("0.00"),
    )
    result = calculate_ltv(ltv_input)

    assert result.is_unsecured is True
    assert result.coverage_status == "unsecured"
    assert result.collateral_shortfall_inr == Decimal("3000000.00")


def test_calculate_ltv_zero_loan() -> None:
    result = calculate_ltv(
        LTVInput(
            requested_loan_amount_inr=Decimal("0.00"),
            eligible_collateral_value_inr=Decimal("1000000.00"),
        )
    )
    assert result.ltv_ratio == Decimal("0.0000")
    assert result.coverage_status == "fully_secured"


def test_ltv_validation() -> None:
    with pytest.raises(ValidationError):
        LTVInput(
            requested_loan_amount_inr=Decimal("-50.00"),
        )
