"""Currency normalization and exchange rate service."""

from datetime import UTC, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

DEFAULT_EXCHANGE_RATES: dict[str, Decimal] = {
    "INR": Decimal("1.00"),
    "USD": Decimal("85.00"),
    "GBP": Decimal("110.00"),
    "EUR": Decimal("92.00"),
    "CAD": Decimal("62.00"),
    "AUD": Decimal("55.00"),
    "SGD": Decimal("63.00"),
    "NZD": Decimal("51.00"),
    "AED": Decimal("23.15"),
}


class CurrencyConversionRequest(BaseModel):
    amount: Decimal = Field(..., ge=0, description="Amount to convert")
    from_currency: str = Field(default="USD", description="Source currency code (ISO 4217)")
    to_currency: str = Field(default="INR", description="Target currency code (ISO 4217)")
    custom_exchange_rate: Decimal | None = Field(
        default=None, gt=0, description="Explicit user or stored exchange rate override"
    )


class CurrencyConversionResult(BaseModel):
    original_amount: Decimal
    from_currency: str
    converted_amount: Decimal
    to_currency: str
    exchange_rate_used: Decimal
    rate_source: str
    timestamp: datetime


def get_default_exchange_rate(from_currency: str, to_currency: str = "INR") -> Decimal:
    """Return default rate converting from `from_currency` to `to_currency`."""
    from_curr = from_currency.upper()
    to_curr = to_currency.upper()

    if from_curr == to_curr:
        return Decimal("1.00")

    if to_curr == "INR" and from_curr in DEFAULT_EXCHANGE_RATES:
        return DEFAULT_EXCHANGE_RATES[from_curr]

    if from_curr == "INR" and to_curr in DEFAULT_EXCHANGE_RATES:
        return (Decimal("1.00") / DEFAULT_EXCHANGE_RATES[to_curr]).quantize(Decimal("0.000001"))

    # Cross rates via INR base
    if from_curr in DEFAULT_EXCHANGE_RATES and to_curr in DEFAULT_EXCHANGE_RATES:
        rate_from_inr = DEFAULT_EXCHANGE_RATES[from_curr]
        rate_to_inr = DEFAULT_EXCHANGE_RATES[to_curr]
        return (rate_from_inr / rate_to_inr).quantize(Decimal("0.000001"))

    raise ValueError(f"Unsupported currency conversion from '{from_curr}' to '{to_curr}'")


def convert_currency(request: CurrencyConversionRequest) -> CurrencyConversionResult:
    """Convert amount between currencies with explicit rate tracking."""
    from_curr = request.from_currency.upper()
    to_curr = request.to_currency.upper()

    if request.custom_exchange_rate is not None:
        rate = request.custom_exchange_rate
        source = "custom_override"
    else:
        rate = get_default_exchange_rate(from_curr, to_curr)
        source = "finora_default_rates"

    converted = (request.amount * rate).quantize(Decimal("0.01"))

    return CurrencyConversionResult(
        original_amount=request.amount.quantize(Decimal("0.01")),
        from_currency=from_curr,
        converted_amount=converted,
        to_currency=to_curr,
        exchange_rate_used=rate,
        rate_source=source,
        timestamp=datetime.now(UTC),
    )


def normalize_to_inr(
    amount: Decimal, currency: str, custom_exchange_rate: Decimal | None = None
) -> CurrencyConversionResult:
    """Convenience helper to normalize any currency amount to INR."""
    return convert_currency(
        CurrencyConversionRequest(
            amount=amount,
            from_currency=currency,
            to_currency="INR",
            custom_exchange_rate=custom_exchange_rate,
        )
    )
