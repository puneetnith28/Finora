"""Unit tests for EMI Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.services.emi_calculator import (
    EMIInput,
    calculate_emi,
)


def test_calculate_standard_education_loan_emi() -> None:
    # 4,000,000 INR at 10.5% annual rate for 10 years (120 months)
    emi_input = EMIInput(
        principal_inr=Decimal("4000000.00"),
        annual_interest_rate_percent=Decimal("10.50"),
        tenure_months=120,
    )
    result = calculate_emi(emi_input)

    # Standard formula check: ~53,974.03 INR / month
    assert result.monthly_emi_inr > Decimal("53000.00")
    assert result.monthly_emi_inr < Decimal("55000.00")
    assert result.total_repayment_inr > Decimal("6400000.00")
    assert result.total_interest_inr > Decimal("2400000.00")
    assert len(result.amortization_schedule) == 10
    # Final closing balance should be 0.00
    assert result.amortization_schedule[-1].closing_balance_inr == Decimal("0.00")


def test_calculate_emi_zero_interest() -> None:
    emi_input = EMIInput(
        principal_inr=Decimal("120000.00"),
        annual_interest_rate_percent=Decimal("0.00"),
        tenure_months=12,
    )
    result = calculate_emi(emi_input)
    assert result.monthly_emi_inr == Decimal("10000.00")
    assert result.total_interest_inr == Decimal("0.00")
    assert result.total_repayment_inr == Decimal("120000.00")


def test_calculate_emi_zero_principal() -> None:
    emi_input = EMIInput(
        principal_inr=Decimal("0.00"),
        annual_interest_rate_percent=Decimal("9.00"),
        tenure_months=36,
    )
    result = calculate_emi(emi_input)
    assert result.monthly_emi_inr == Decimal("0.00")
    assert result.total_interest_inr == Decimal("0.00")


def test_emi_validation() -> None:
    with pytest.raises(ValidationError):
        EMIInput(
            principal_inr=Decimal("-500.00"),
            annual_interest_rate_percent=Decimal("8.00"),
            tenure_months=12,
        )

    with pytest.raises(ValidationError):
        EMIInput(
            principal_inr=Decimal("100000.00"),
            annual_interest_rate_percent=Decimal("-2.00"),
            tenure_months=12,
        )

    with pytest.raises(ValidationError):
        EMIInput(
            principal_inr=Decimal("100000.00"),
            annual_interest_rate_percent=Decimal("8.00"),
            tenure_months=0,
        )
