"""Lender and Underwriting Criteria API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.seed_lenders import seed_demo_lenders
from app.db.session import get_db
from app.models.lender import Lender, LenderCriterion
from app.schemas.lender import (
    LenderCreate,
    LenderResponse,
    LenderUpdate,
)

router = APIRouter(prefix="/lenders", tags=["Lenders"])


@router.get(
    "",
    response_model=list[LenderResponse],
    summary="List all lenders with criteria",
)
def list_lenders(
    active_only: bool = True,
    db: Session = Depends(get_db),
) -> list[Lender]:
    """Retrieve all available lending partners and their underwriting rules.

    Automatically populates demo seed data if the database is currently empty.
    """
    count = db.query(Lender).count()
    if count == 0:
        seed_demo_lenders(db)

    query = db.query(Lender)
    if active_only:
        query = query.filter(Lender.active.is_(True))

    return query.all()


@router.get(
    "/{lender_id}",
    response_model=LenderResponse,
    summary="Get lender by ID",
)
def get_lender(
    lender_id: int,
    db: Session = Depends(get_db),
) -> Lender:
    """Fetch details and criteria for a specific lender."""
    lender = db.query(Lender).filter(Lender.id == lender_id).first()
    if not lender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender with id {lender_id} not found",
        )
    return lender


@router.post(
    "",
    response_model=LenderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create custom lender profile",
)
def create_lender(
    payload: LenderCreate,
    db: Session = Depends(get_db),
) -> Lender:
    """Create a new lender institution and associated criteria."""
    existing = db.query(Lender).filter(Lender.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Lender with name '{payload.name}' already exists",
        )

    lender = Lender(
        name=payload.name,
        description=payload.description,
        active=payload.active,
    )
    db.add(lender)
    db.flush()

    for crit in payload.criteria:
        c_obj = LenderCriterion(
            lender_id=lender.id,
            criterion_type=crit.criterion_type,
            operator=crit.operator,
            threshold_value=crit.threshold_value,
            threshold_text=crit.threshold_text,
            required=crit.required,
            weight=crit.weight,
            configuration_json=crit.configuration_json,
        )
        db.add(c_obj)

    db.commit()
    db.refresh(lender)
    return lender


@router.patch(
    "/{lender_id}",
    response_model=LenderResponse,
    summary="Update lender profile",
)
def update_lender(
    lender_id: int,
    payload: LenderUpdate,
    db: Session = Depends(get_db),
) -> Lender:
    """Update lender information or active status."""
    lender = db.query(Lender).filter(Lender.id == lender_id).first()
    if not lender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender with id {lender_id} not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(lender, field, val)

    db.commit()
    db.refresh(lender)
    return lender
