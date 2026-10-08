"""Assessment API routes for running evaluations and retrieving historical results."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.student import Student
from app.schemas.assessment import (
    AssessmentComparisonResponse,
    AssessmentResponse,
    MetricDelta,
)
from app.services.assessment_orchestrator import FullAssessmentReport, run_candidate_assessment

student_assessment_router = APIRouter(prefix="/students/{student_id}/assessments", tags=["Assessments"])
student_assessment_singular_router = APIRouter(prefix="/students/{student_id}/assessment", tags=["Assessments"])
assessment_item_router = APIRouter(prefix="/assessments", tags=["Assessments"])


class RunAssessmentRequest(BaseModel):
    requested_loan_amount_inr: Decimal | None = Field(
        default=None, ge=0, description="Optional override for requested loan amount in INR"
    )


@student_assessment_router.post(
    "",
    response_model=FullAssessmentReport,
    status_code=status.HTTP_201_CREATED,
    summary="Run full candidate loan readiness & lender match assessment",
)
@student_assessment_singular_router.post(
    "",
    response_model=FullAssessmentReport,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def create_assessment(
    student_id: int,
    payload: RunAssessmentRequest = RunAssessmentRequest(),
    db: Session = Depends(get_db),
) -> FullAssessmentReport:
    """Execute the deterministic financial engine and lender underwriting criteria.

    Persists full audit history and returns breakdown.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    try:
        report = run_candidate_assessment(
            student_id=student_id,
            db=db,
            requested_loan_amount_inr=payload.requested_loan_amount_inr,
        )
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to execute assessment: {e!s}",
        ) from e


@student_assessment_router.get(
    "",
    response_model=list[AssessmentResponse],
    summary="Get assessment history for a student",
)
@student_assessment_singular_router.get(
    "",
    response_model=list[AssessmentResponse],
    include_in_schema=False,
)
def list_student_assessments(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[Assessment]:
    """Retrieve historical assessment runs and stored metric results."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    return (
        db.query(Assessment)
        .filter(Assessment.student_id == student_id)
        .order_by(Assessment.id.desc())
        .all()
    )


@assessment_item_router.get(
    "/compare",
    response_model=AssessmentComparisonResponse,
    summary="Compare two historical assessment runs side-by-side",
)
def compare_assessments(
    base_id: int,
    target_id: int,
    db: Session = Depends(get_db),
) -> AssessmentComparisonResponse:
    """Compute financial & underwriting delta between two assessment versions."""
    base = db.query(Assessment).filter(Assessment.id == base_id).first()
    target = db.query(Assessment).filter(Assessment.id == target_id).first()
    if not base or not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both assessments not found for comparison",
        )

    base_res = base.results[0] if base.results else None
    target_res = target.results[0] if target.results else None

    base_score = base_res.readiness_score if base_res else Decimal("0.0")
    target_score = target_res.readiness_score if target_res else Decimal("0.0")
    score_delta = target_score - base_score

    base_foir = base_res.foir if base_res else Decimal("0.0")
    target_foir = target_res.foir if target_res else Decimal("0.0")
    foir_delta = target_foir - base_foir

    base_gap = base_res.funding_gap if base_res else Decimal("0.0")
    target_gap = target_res.funding_gap if target_res else Decimal("0.0")
    gap_delta = target_gap - base_gap

    base_cost = base_res.total_study_cost if base_res else Decimal("0.0")
    target_cost = target_res.total_study_cost if target_res else Decimal("0.0")
    cost_delta = target_cost - base_cost

    insight = (
        f"Readiness score changed by {score_delta:+.1f} points. "
        f"FOIR shifted by {foir_delta:+.2f}%. "
        f"Funding gap shifted by INR {gap_delta:+,.0f}."
    )

    return AssessmentComparisonResponse(
        baseline_assessment_id=base_id,
        target_assessment_id=target_id,
        readiness_score=MetricDelta(
            baseline=base_score,
            target=target_score,
            delta=score_delta,
            improved=score_delta > 0,
        ),
        foir=MetricDelta(
            baseline=base_foir,
            target=target_foir,
            delta=foir_delta,
            improved=foir_delta < 0,
        ),
        funding_gap=MetricDelta(
            baseline=base_gap,
            target=target_gap,
            delta=gap_delta,
            improved=gap_delta < 0,
        ),
        total_study_cost=MetricDelta(
            baseline=base_cost,
            target=target_cost,
            delta=cost_delta,
            improved=cost_delta <= 0,
        ),
        summary_insight=insight,
    )


@assessment_item_router.get(
    "/{assessment_id}",
    response_model=AssessmentResponse,
    summary="Get single assessment with full results",
)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
) -> Assessment:
    """Fetch stored assessment snapshot by ID."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment with id {assessment_id} not found",
        )
    return assessment

