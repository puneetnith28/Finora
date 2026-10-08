"""Assessment API routes for running evaluations and retrieving historical results."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.student import Student
from app.schemas.assessment import AssessmentResponse
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
