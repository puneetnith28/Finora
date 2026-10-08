"""Pydantic schemas package."""

from app.schemas.asset import AssetBase, AssetCreate, AssetResponse, AssetUpdate
from app.schemas.collateral import (
    CollateralBase,
    CollateralCreate,
    CollateralRead,
    CollateralResponse,
    CollateralUpdate,
)
from app.schemas.document import (
    DocumentBase,
    DocumentCreate,
    DocumentRead,
    DocumentResponse,
    DocumentUpdate,
)
from app.schemas.financial_profile import (
    FinancialProfileBase,
    FinancialProfileCreate,
    FinancialProfileResponse,
    FinancialProfileUpdate,
)
from app.schemas.funding_source import (
    FundingSourceBase,
    FundingSourceCreate,
    FundingSourceResponse,
    FundingSourceUpdate,
)
from app.schemas.lender import (
    LenderBase,
    LenderCreate,
    LenderCriterionBase,
    LenderCriterionCreate,
    LenderCriterionRead,
    LenderCriterionResponse,
    LenderCriterionUpdate,
    LenderRead,
    LenderResponse,
    LenderUpdate,
)
from app.schemas.liability import (
    LiabilityBase,
    LiabilityCreate,
    LiabilityResponse,
    LiabilityUpdate,
)
from app.schemas.student import StudentBase, StudentCreate, StudentResponse, StudentUpdate
from app.schemas.study_plan import (
    StudyPlanBase,
    StudyPlanCreate,
    StudyPlanResponse,
    StudyPlanUpdate,
)

__all__ = [
    "AssetBase",
    "AssetCreate",
    "AssetResponse",
    "AssetUpdate",
    "CollateralBase",
    "CollateralCreate",
    "CollateralRead",
    "CollateralResponse",
    "CollateralUpdate",
    "DocumentBase",
    "DocumentCreate",
    "DocumentRead",
    "DocumentResponse",
    "DocumentUpdate",
    "FinancialProfileBase",
    "FinancialProfileCreate",
    "FinancialProfileResponse",
    "FinancialProfileUpdate",
    "FundingSourceBase",
    "FundingSourceCreate",
    "FundingSourceResponse",
    "FundingSourceUpdate",
    "LenderBase",
    "LenderCreate",
    "LenderCriterionBase",
    "LenderCriterionCreate",
    "LenderCriterionRead",
    "LenderCriterionResponse",
    "LenderCriterionUpdate",
    "LenderRead",
    "LenderResponse",
    "LenderUpdate",
    "LiabilityBase",
    "LiabilityCreate",
    "LiabilityResponse",
    "LiabilityUpdate",
    "StudentBase",
    "StudentCreate",
    "StudentResponse",
    "StudentUpdate",
    "StudyPlanBase",
    "StudyPlanCreate",
    "StudyPlanResponse",
    "StudyPlanUpdate",
]
