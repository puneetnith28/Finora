"""Funding Source API routes."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.funding_source import FundingSource, FundingSourceType
from app.models.student import Student
from app.schemas.funding_source import FundingSourceResponse, FundingSourceUpdate
from app.services.currency_service import get_default_exchange_rate

# Router mounted at /students/{student_id}/funding and /funding
student_funding_router = APIRouter(prefix="/students/{student_id}/funding", tags=["Funding Sources"])
funding_item_router = APIRouter(prefix="/funding", tags=["Funding Sources"])


class FundingSourceInput(BaseModel):
    source_type: FundingSourceType
    amount_original: Decimal = Field(..., ge=0)
    currency: str = Field(default="INR", min_length=1, max_length=10)
    exchange_rate_to_inr: Decimal | None = Field(default=None, gt=0)
    verified: bool = Field(default=False)


def _compute_funding_inr(amount: Decimal, currency: str, rate: Decimal | None) -> tuple[Decimal, Decimal]:
    exchange_rate = rate if rate and rate > 0 else get_default_exchange_rate(currency)
    amount_inr = (amount * exchange_rate).quantize(Decimal("0.01"))
    return amount_inr, exchange_rate


@student_funding_router.post(
    "",
    response_model=FundingSourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add funding source for a student",
)
def add_funding_source(
    student_id: int,
    payload: FundingSourceInput,
    db: Session = Depends(get_db),
) -> FundingSource:
    """Create and link a new self-funding source for a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    amount_inr, exchange_rate = _compute_funding_inr(
        payload.amount_original, payload.currency, payload.exchange_rate_to_inr
    )

    funding = FundingSource(
        student_id=student_id,
        source_type=payload.source_type,
        amount_original=payload.amount_original,
        currency=payload.currency,
        exchange_rate_to_inr=exchange_rate,
        amount_inr=amount_inr,
        verified=payload.verified,
    )
    db.add(funding)
    db.commit()
    db.refresh(funding)
    return funding


@student_funding_router.get(
    "",
    response_model=list[FundingSourceResponse],
    summary="List funding sources for a student",
)
def list_student_funding_sources(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[FundingSource]:
    """Retrieve all funding sources attached to a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    return db.query(FundingSource).filter(FundingSource.student_id == student_id).all()


@funding_item_router.get(
    "/{funding_id}",
    response_model=FundingSourceResponse,
    summary="Get single funding source",
)
def get_funding_source(
    funding_id: int,
    db: Session = Depends(get_db),
) -> FundingSource:
    """Fetch a single funding source item."""
    item = db.query(FundingSource).filter(FundingSource.id == funding_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funding source with id {funding_id} not found",
        )
    return item


@funding_item_router.patch(
    "/{funding_id}",
    response_model=FundingSourceResponse,
    summary="Update funding source",
)
def update_funding_source(
    funding_id: int,
    payload: FundingSourceUpdate,
    db: Session = Depends(get_db),
) -> FundingSource:
    """Partially update a funding source and recompute converted INR value."""
    item = db.query(FundingSource).filter(FundingSource.id == funding_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funding source with id {funding_id} not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(item, field, val)

    amount_inr, exchange_rate = _compute_funding_inr(
        item.amount_original, item.currency, item.exchange_rate_to_inr
    )
    item.exchange_rate_to_inr = exchange_rate
    item.amount_inr = amount_inr

    db.commit()
    db.refresh(item)
    return item


@funding_item_router.delete(
    "/{funding_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete funding source",
)
def delete_funding_source(
    funding_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a funding source item."""
    item = db.query(FundingSource).filter(FundingSource.id == funding_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funding source with id {funding_id} not found",
        )
    db.delete(item)
    db.commit()
