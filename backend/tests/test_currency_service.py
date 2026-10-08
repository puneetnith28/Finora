"""Unit tests for Currency normalization service."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.services.currency_service import (
    CurrencyConversionRequest,
    convert_currency,
    get_default_exchange_rate,
    normalize_to_inr,
)


def test_default_rate_lookup() -> None:
    assert get_default_exchange_rate("USD", "INR") == Decimal("85.00")
    assert get_default_exchange_rate("GBP", "INR") == Decimal("110.00")
    assert get_default_exchange_rate("EUR", "INR") == Decimal("92.00")
    assert get_default_exchange_rate("CAD", "INR") == Decimal("62.00")
    assert get_default_exchange_rate("INR", "INR") == Decimal("1.00")

    with pytest.raises(ValueError, match="Unsupported currency"):
        get_default_exchange_rate("XYZ_UNSUPPORTED", "INR")


def test_convert_currency_with_default_rate() -> None:
    req = CurrencyConversionRequest(
        amount=Decimal("1000.00"),
        from_currency="USD",
        to_currency="INR",
    )
    res = convert_currency(req)
    assert res.converted_amount == Decimal("85000.00")
    assert res.exchange_rate_used == Decimal("85.00")
    assert res.rate_source == "finora_default_rates"
    assert res.timestamp is not None


def test_convert_currency_with_custom_rate() -> None:
    req = CurrencyConversionRequest(
        amount=Decimal("1000.00"),
        from_currency="USD",
        to_currency="INR",
        custom_exchange_rate=Decimal("86.25"),
    )
    res = convert_currency(req)
    assert res.converted_amount == Decimal("86250.00")
    assert res.exchange_rate_used == Decimal("86.25")
    assert res.rate_source == "custom_override"


def test_normalize_to_inr_helper() -> None:
    res = normalize_to_inr(Decimal("500.00"), "GBP")
    assert res.converted_amount == Decimal("55000.00")
    assert res.to_currency == "INR"


def test_currency_request_validation() -> None:
    with pytest.raises(ValidationError):
        CurrencyConversionRequest(
            amount=Decimal("-10.00"),
            from_currency="USD",
            to_currency="INR",
        )

    with pytest.raises(ValidationError):
        CurrencyConversionRequest(
            amount=Decimal("100.00"),
            from_currency="USD",
            to_currency="INR",
            custom_exchange_rate=Decimal("0.00"),
        )
