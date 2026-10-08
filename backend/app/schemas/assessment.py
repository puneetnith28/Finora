"""Pydantic schemas for Assessment and Assessment results."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.assessment import AssessmentStatus


class AssessmentRuleResultBase(BaseModel):
    lender_id: int = Field(..., description="ID of evaluating lender")
    criterion_id: int | None = Field(
        default=None, description="Optional ID of specific criterion evaluated"
    )
    passed: bool = Field(..., description="Whether the criterion passed or failed")
    actual_value: str | None = Field(
        default=None, description="Actual evaluated metric value from candidate profile"
    )
    expected_value: str | None = Field(
        default=None, description="Required threshold or expected condition"
    )
    reason: str | None = Field(
        default=None, description="Diagnostic reason, explanation or feedback"
    )


class AssessmentRuleResultCreate(AssessmentRuleResultBase):
    assessment_result_id: int | None = None


class AssessmentRuleResultResponse(AssessmentRuleResultBase):
    id: int
    assessment_result_id: int

    model_config = ConfigDict(from_attributes=True)


class AssessmentResultBase(BaseModel):
    total_study_cost: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total computed study cost in INR"
    )
    available_funding: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Total verified self-funding in INR"
    )
    funding_gap: Decimal = Field(
        default=Decimal("0.0"), description="Net funding gap (Cost - Available)"
    )
    net_worth: Decimal = Field(
        default=Decimal("0.0"), description="Total net worth (Assets - Liabilities)"
    )
    foir: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Fixed Obligation to Income Ratio"
    )
    ltv: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Loan-to-Value ratio against eligible collateral"
    )
    readiness_score: Decimal = Field(
        default=Decimal("0.0"), ge=0, le=100, description="Finora readiness score (0-100)"
    )


class AssessmentResultCreate(AssessmentResultBase):
    assessment_id: int | None = None
    rule_results: list[AssessmentRuleResultBase] = Field(default_factory=list)


class AssessmentResultResponse(AssessmentResultBase):
    id: int
    assessment_id: int
    created_at: datetime
    rule_results: list[AssessmentRuleResultResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AssessmentBase(BaseModel):
    requested_loan_amount: Decimal = Field(
        default=Decimal("0.0"), ge=0, description="Requested education loan amount in INR"
    )
    status: AssessmentStatus = Field(
        default=AssessmentStatus.PENDING, description="Assessment run status"
    )


class AssessmentCreate(AssessmentBase):
    student_id: int


class AssessmentUpdate(BaseModel):
    status: AssessmentStatus | None = None
    completed_at: datetime | None = None


class AssessmentResponse(AssessmentBase):
    id: int
    student_id: int
    created_at: datetime
    completed_at: datetime | None = None
    results: list[AssessmentResultResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


AssessmentRead = AssessmentResponse
AssessmentResultRead = AssessmentResultResponse
AssessmentRuleResultRead = AssessmentRuleResultResponse
