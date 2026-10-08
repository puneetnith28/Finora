"""Domain models package."""

from app.db.base import Base
from app.models.assessment import (
    Assessment,
    AssessmentResult,
    AssessmentRuleResult,
    AssessmentStatus,
)
from app.models.asset import Asset, AssetType
from app.models.collateral import Collateral, CollateralType, OwnershipStatus
from app.models.document import Document, DocumentStatus, DocumentType, ExtractionStatus
from app.models.financial_profile import FinancialProfile
from app.models.funding_source import FundingSource, FundingSourceType
from app.models.lender import CriterionOperator, CriterionType, Lender, LenderCriterion
from app.models.liability import Liability, LiabilityType
from app.models.student import Student
from app.models.study_plan import StudyPlan

__all__ = [
    "Assessment",
    "AssessmentResult",
    "AssessmentRuleResult",
    "AssessmentStatus",
    "Asset",
    "AssetType",
    "Base",
    "Collateral",
    "CollateralType",
    "CriterionOperator",
    "CriterionType",
    "Document",
    "DocumentStatus",
    "DocumentType",
    "ExtractionStatus",
    "FinancialProfile",
    "FundingSource",
    "FundingSourceType",
    "Lender",
    "LenderCriterion",
    "Liability",
    "LiabilityType",
    "OwnershipStatus",
    "Student",
    "StudyPlan",
]
