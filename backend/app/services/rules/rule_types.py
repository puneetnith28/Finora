"""Lender rule types and definitions."""

import enum
from decimal import Decimal

from pydantic import BaseModel, Field


class RuleType(enum.StrEnum):
    MINIMUM_INCOME = "minimum_income"
    MAXIMUM_FOIR = "maximum_foir"
    MAXIMUM_LTV = "maximum_ltv"
    MAXIMUM_LOAN_AMOUNT = "maximum_loan_amount"
    MINIMUM_COLLATERAL_VALUE = "minimum_collateral_value"
    COUNTRY_ALLOWED = "country_allowed"
    COURSE_ALLOWED = "course_allowed"
    COURSE_LEVEL_ALLOWED = "course_level_allowed"
    COLLATERAL_REQUIRED = "collateral_required"
    DOCUMENT_REQUIRED = "document_required"
    MIN_CIBIL_SCORE = "min_cibil_score"
    MIN_LIQUID_ASSETS_RATIO = "min_liquid_assets_ratio"
    CUSTOM = "custom"


class RuleOperator(enum.StrEnum):
    GTE = ">="
    LTE = "<="
    GT = ">"
    LT = "<"
    EQ = "=="
    NEQ = "!="
    IN = "in"
    NOT_IN = "not_in"
    REQUIRED = "required"


class RuleSeverity(enum.StrEnum):
    HARD_CONSTRAINT = "hard_constraint"  # If failed -> NOT_A_MATCH
    REVIEW = "review"  # If failed -> NEEDS_REVIEW
    PREFERENCE = "preference"  # Influences score/weight


class RuleDefinition(BaseModel):
    rule_type: RuleType
    operator: RuleOperator
    expected_numeric: Decimal | None = None
    expected_text: str | None = None
    expected_list: list[str] = Field(default_factory=list)
    severity: RuleSeverity = RuleSeverity.HARD_CONSTRAINT
    weight: Decimal = Field(default=Decimal("1.00"), ge=0)
    description: str | None = None
