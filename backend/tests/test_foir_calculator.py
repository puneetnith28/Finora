"""Unit tests for FOIR Calculation Service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.services.foir_calculator import (
    FOIRInput,
    calculate_foir,
)


def test_calculate_foir_healthy() -> None:
    # Monthly net income: 150,000 INR; Existing EMI: 20,000; Proposed EMI: 30,000
    foir_input = FOIRInput(
        monthly_net_income_inr=Decimal("150000.00"),
        existing_monthly_emi_inr=Decimal("20000.00"),
        proposed_monthly_emi_inr=Decimal("30000.00"),
        other_monthly_obligations_inr=Decimal("0.00"),
    )
    result = calculate_foir(foir_input)

    # Obligations: 50,000; FOIR: 50,000 / 150,000 = 33.33%
    assert result.total_monthly_obligations_inr == Decimal("50000.00")
    assert result.foir_ratio == Decimal("0.3333")
    assert result.foir_percentage == Decimal("33.33")
    assert result.disposable_income_inr == Decimal("100000.00")
    assert result.is_affordable is True
    assert result.risk_category == "low_risk"


def test_calculate_foir_high_burden() -> None:
    # Monthly net income: 80,000; Existing EMI: 35,000; Proposed EMI: 30,000
    foir_input = FOIRInput(
        monthly_net_income_inr=Decimal("80000.00"),
        existing_monthly_emi_inr=Decimal("35000.00"),
        proposed_monthly_emi_inr=Decimal("30000.00"),
        other_monthly_obligations_inr=Decimal("5000.00"),
    )
    result = calculate_foir(foir_input)

    # Obligations: 70,000; FOIR: 70,000 / 80,000 = 87.5%
    assert result.total_monthly_obligations_inr == Decimal("70000.00")
    assert result.foir_ratio == Decimal("0.8750")
    assert result.foir_percentage == Decimal("87.50")
    assert result.disposable_income_inr == Decimal("10000.00")
    assert result.is_affordable is False
    assert result.risk_category == "critical_risk"


def test_calculate_foir_zero_income() -> None:
    foir_input = FOIRInput(
        monthly_net_income_inr=Decimal("0.00"),
        existing_monthly_emi_inr=Decimal("10000.00"),
    )
    result = calculate_foir(foir_input)
    assert result.foir_ratio == Decimal("1.0000")
    assert result.is_affordable is False


def test_foir_validation() -> None:
    with pytest.raises(ValidationError):
        FOIRInput(
            monthly_net_income_inr=Decimal("-100.00"),
        )
