"""Deterministic Funding Calculation Service."""

from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.funding_source import FundingSourceType
from app.services.currency_service import normalize_to_inr


class FundingItem(BaseModel):
    funding_type: FundingSourceType = Field(default=FundingSourceType.SAVINGS)
    source_name: str = Field(default="", description="Name or description of source")
    amount: Decimal = Field(default=Decimal("0.0"), ge=0)
    currency: str = Field(default="INR")
    exchange_rate: Decimal | None = Field(default=None, gt=0)


class FundingCalculationResult(BaseModel):
    total_funding_inr: Decimal
    breakdown_by_type_inr: dict[str, Decimal]
    items_inr: list[dict[str, str | Decimal]]


def calculate_available_funding(items: list[FundingItem]) -> FundingCalculationResult:
    """Calculate total available self-funding normalized to INR with category breakdown."""
    total_inr = Decimal("0.00")
    breakdown: dict[str, Decimal] = {f_type.value: Decimal("0.00") for f_type in FundingSourceType}
    items_inr_list: list[dict[str, str | Decimal]] = []

    for item in items:
        converted = normalize_to_inr(
            amount=item.amount,
            currency=item.currency,
            custom_exchange_rate=item.exchange_rate,
        )
        item_inr = converted.converted_amount
        total_inr += item_inr
        breakdown[item.funding_type.value] = (
            breakdown[item.funding_type.value] + item_inr
        ).quantize(Decimal("0.01"))

        items_inr_list.append(
            {
                "type": item.funding_type.value,
                "source_name": item.source_name,
                "original_amount": item.amount,
                "currency": item.currency.upper(),
                "exchange_rate": converted.exchange_rate_used,
                "amount_inr": item_inr,
            }
        )

    return FundingCalculationResult(
        total_funding_inr=total_inr.quantize(Decimal("0.01")),
        breakdown_by_type_inr=breakdown,
        items_inr=items_inr_list,
    )
