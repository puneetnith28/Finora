"""StudyPlan API routes for candidate study plans."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.models.study_plan import StudyPlan
from app.schemas.study_plan import StudyPlanResponse, StudyPlanUpdate
from app.services.currency_service import get_default_exchange_rate
from app.services.study_cost_calculator import StudyCostBreakdown, calculate_study_cost

router = APIRouter(prefix="/students/{student_id}/study-plan", tags=["Study Plans"])


class StudyPlanInput(BaseModel):
    tuition_fee: Decimal = Field(default=Decimal("0.0"), ge=0)
    living_expenses: Decimal = Field(default=Decimal("0.0"), ge=0)
    travel_expenses: Decimal = Field(default=Decimal("0.0"), ge=0)
    other_expenses: Decimal = Field(default=Decimal("0.0"), ge=0)
    currency: str = Field(default="USD", min_length=1, max_length=10)
    duration_months: int = Field(default=24, ge=1, le=120)
    exchange_rate_to_inr: Decimal | None = Field(default=None, gt=0)


def _recompute_costs(
    tuition: Decimal,
    living: Decimal,
    travel: Decimal,
    other: Decimal,
    currency: str,
    duration: int,
    rate: Decimal | None,
) -> tuple[Decimal, Decimal, Decimal]:
    exchange_rate = rate if rate and rate > 0 else get_default_exchange_rate(currency)
    calc_res = calculate_study_cost(
        StudyCostBreakdown(
            tuition_fee=tuition,
            living_expense=living,
            travel_expense=travel,
            other_expense=other,
            duration_months=duration,
            currency=currency,
            exchange_rate=exchange_rate,
        )
    )
    return calc_res.total_cost_original_currency, calc_res.total_cost_inr, exchange_rate


@router.post(
    "",
    response_model=StudyPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or replace student study plan",
)
def create_study_plan(
    student_id: int,
    payload: StudyPlanInput,
    db: Session = Depends(get_db),
) -> StudyPlan:
    """Create or overwrite study plan for a student with deterministic cost calculation."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    # Recompute total costs
    total_orig, total_inr, exchange_rate = _recompute_costs(
        payload.tuition_fee,
        payload.living_expenses,
        payload.travel_expenses,
        payload.other_expenses,
        payload.currency,
        payload.duration_months,
        payload.exchange_rate_to_inr,
    )

    existing = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()
    if existing:
        existing.tuition_fee = payload.tuition_fee
        existing.living_expenses = payload.living_expenses
        existing.travel_expenses = payload.travel_expenses
        existing.other_expenses = payload.other_expenses
        existing.currency = payload.currency
        existing.duration_months = payload.duration_months
        existing.exchange_rate_to_inr = exchange_rate
        existing.total_cost_original = total_orig
        existing.total_cost_inr = total_inr
        db.commit()
        db.refresh(existing)
        return existing

    study_plan = StudyPlan(
        student_id=student_id,
        tuition_fee=payload.tuition_fee,
        living_expenses=payload.living_expenses,
        travel_expenses=payload.travel_expenses,
        other_expenses=payload.other_expenses,
        currency=payload.currency,
        duration_months=payload.duration_months,
        exchange_rate_to_inr=exchange_rate,
        total_cost_original=total_orig,
        total_cost_inr=total_inr,
    )
    db.add(study_plan)
    db.commit()
    db.refresh(study_plan)
    return study_plan


@router.get(
    "",
    response_model=StudyPlanResponse,
    summary="Get student study plan",
)
def get_study_plan(
    student_id: int,
    db: Session = Depends(get_db),
) -> StudyPlan:
    """Fetch the active study plan for a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    study_plan = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()
    if not study_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No study plan found for student id {student_id}",
        )
    return study_plan


@router.patch(
    "",
    response_model=StudyPlanResponse,
    summary="Update student study plan",
)
def update_study_plan(
    student_id: int,
    payload: StudyPlanUpdate,
    db: Session = Depends(get_db),
) -> StudyPlan:
    """Partially update a study plan and recompute totals."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    study_plan = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).first()
    if not study_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No study plan found for student id {student_id}",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(study_plan, field, val)

    # Recompute totals
    total_orig, total_inr, exchange_rate = _recompute_costs(
        study_plan.tuition_fee,
        study_plan.living_expenses,
        study_plan.travel_expenses,
        study_plan.other_expenses,
        study_plan.currency,
        study_plan.duration_months,
        study_plan.exchange_rate_to_inr,
    )
    study_plan.exchange_rate_to_inr = exchange_rate
    study_plan.total_cost_original = total_orig
    study_plan.total_cost_inr = total_inr

    db.commit()
    db.refresh(study_plan)
    return study_plan
