"""Services package for Finora business logic and financial calculations."""

from app.services.currency_service import (
    DEFAULT_EXCHANGE_RATES,
    CurrencyConversionRequest,
    CurrencyConversionResult,
    convert_currency,
    get_default_exchange_rate,
    normalize_to_inr,
)
from app.services.funding_calculator import (
    FundingCalculationResult,
    FundingItem,
    calculate_available_funding,
)
from app.services.funding_gap_calculator import (
    FundingGapInput,
    FundingGapResult,
    calculate_funding_gap,
)
from app.services.net_worth_calculator import (
    AssetSummaryItem,
    LiabilitySummaryItem,
    NetWorthCalculationInput,
    NetWorthCalculationResult,
    calculate_net_worth,
)
from app.services.study_cost_calculator import (
    StudyCostBreakdown,
    StudyCostResult,
    calculate_study_cost,
)

__all__ = [
    "AssetSummaryItem",
    "CurrencyConversionRequest",
    "CurrencyConversionResult",
    "DEFAULT_EXCHANGE_RATES",
    "FundingCalculationResult",
    "FundingGapInput",
    "FundingGapResult",
    "FundingItem",
    "LiabilitySummaryItem",
    "NetWorthCalculationInput",
    "NetWorthCalculationResult",
    "StudyCostBreakdown",
    "StudyCostResult",
    "calculate_available_funding",
    "calculate_funding_gap",
    "calculate_net_worth",
    "calculate_study_cost",
    "convert_currency",
    "get_default_exchange_rate",
    "normalize_to_inr",
]
