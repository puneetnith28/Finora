"""Services package for Finora business logic and financial calculations."""

from app.services.collateral_calculator import (
    COLLATERAL_HAIRCUT_FACTORS,
    OWNERSHIP_ELIGIBILITY_FACTORS,
    CollateralItemInput,
    CollateralValuationItemResult,
    CollateralValuationResult,
    calculate_collateral_value,
)
from app.services.currency_service import (
    DEFAULT_EXCHANGE_RATES,
    CurrencyConversionRequest,
    CurrencyConversionResult,
    convert_currency,
    get_default_exchange_rate,
    normalize_to_inr,
)
from app.services.emi_calculator import (
    AmortizationYear,
    EMIInput,
    EMIResult,
    calculate_emi,
)
from app.services.foir_calculator import (
    FOIRInput,
    FOIRResult,
    calculate_foir,
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
    "AmortizationYear",
    "AssetSummaryItem",
    "COLLATERAL_HAIRCUT_FACTORS",
    "CollateralItemInput",
    "CollateralValuationItemResult",
    "CollateralValuationResult",
    "CurrencyConversionRequest",
    "CurrencyConversionResult",
    "DEFAULT_EXCHANGE_RATES",
    "EMIInput",
    "EMIResult",
    "FOIRInput",
    "FOIRResult",
    "FundingCalculationResult",
    "FundingGapInput",
    "FundingGapResult",
    "FundingItem",
    "LiabilitySummaryItem",
    "NetWorthCalculationInput",
    "NetWorthCalculationResult",
    "OWNERSHIP_ELIGIBILITY_FACTORS",
    "StudyCostBreakdown",
    "StudyCostResult",
    "calculate_available_funding",
    "calculate_collateral_value",
    "calculate_emi",
    "calculate_foir",
    "calculate_funding_gap",
    "calculate_net_worth",
    "calculate_study_cost",
    "convert_currency",
    "get_default_exchange_rate",
    "normalize_to_inr",
]
