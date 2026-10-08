"""Collateral API routes."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.collateral import Collateral, CollateralType, OwnershipStatus
from app.models.student import Student
from app.schemas.collateral import CollateralResponse, CollateralUpdate
from app.services.collateral_calculator import CollateralItemInput, calculate_collateral_value

# Routers mounted at /students/{student_id}/collateral, /students/{student_id}/collaterals, /collateral, /collaterals
student_collateral_router = APIRouter(prefix="/students/{student_id}/collateral", tags=["Collateral"])
student_collaterals_plural_router = APIRouter(prefix="/students/{student_id}/collaterals", tags=["Collateral"])
collateral_item_router = APIRouter(prefix="/collateral", tags=["Collateral"])
collaterals_item_plural_router = APIRouter(prefix="/collaterals", tags=["Collateral"])


class CollateralInput(BaseModel):
    asset_id: int | None = None
    collateral_type: CollateralType = Field(default=CollateralType.PROPERTY)
    ownership_status: OwnershipStatus = Field(default=OwnershipStatus.SOLE)
    description: str | None = None
    market_value_inr: Decimal = Field(default=Decimal("0.0"), ge=0)
    existing_encumbrance_inr: Decimal = Field(default=Decimal("0.0"), ge=0)


def _compute_collateral_eligible_value(
    c_type: CollateralType,
    ownership: OwnershipStatus,
    market_val: Decimal,
    encumbrance: Decimal,
) -> Decimal:
    res = calculate_collateral_value(
        [
            CollateralItemInput(
                collateral_type=c_type,
                ownership_status=ownership,
                market_value_inr=market_val,
                existing_encumbrance_inr=encumbrance,
            )
        ]
    )
    return res.total_eligible_value_inr


@student_collateral_router.post(
    "",
    response_model=CollateralResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add collateral for student",
)
@student_collaterals_plural_router.post(
    "",
    response_model=CollateralResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def add_collateral(
    student_id: int,
    payload: CollateralInput,
    db: Session = Depends(get_db),
) -> Collateral:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    eligible_val = _compute_collateral_eligible_value(
        payload.collateral_type,
        payload.ownership_status,
        payload.market_value_inr,
        payload.existing_encumbrance_inr,
    )

    collateral = Collateral(
        student_id=student_id,
        asset_id=payload.asset_id,
        collateral_type=payload.collateral_type,
        ownership_status=payload.ownership_status,
        description=payload.description,
        market_value_inr=payload.market_value_inr,
        existing_encumbrance_inr=payload.existing_encumbrance_inr,
        eligible_value_inr=eligible_val,
    )
    db.add(collateral)
    db.commit()
    db.refresh(collateral)
    return collateral


@student_collateral_router.get(
    "",
    response_model=list[CollateralResponse],
    summary="List all collaterals for a student",
)
@student_collaterals_plural_router.get(
    "",
    response_model=list[CollateralResponse],
    include_in_schema=False,
)
def list_student_collaterals(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[Collateral]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    return db.query(Collateral).filter(Collateral.student_id == student_id).all()


@collateral_item_router.get(
    "/{collateral_id}",
    response_model=CollateralResponse,
    summary="Get single collateral by ID",
)
@collaterals_item_plural_router.get(
    "/{collateral_id}",
    response_model=CollateralResponse,
    include_in_schema=False,
)
def get_collateral(
    collateral_id: int,
    db: Session = Depends(get_db),
) -> Collateral:
    item = db.query(Collateral).filter(Collateral.id == collateral_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collateral with id {collateral_id} not found",
        )
    return item


@collateral_item_router.patch(
    "/{collateral_id}",
    response_model=CollateralResponse,
    summary="Update single collateral",
)
@collaterals_item_plural_router.patch(
    "/{collateral_id}",
    response_model=CollateralResponse,
    include_in_schema=False,
)
def update_collateral(
    collateral_id: int,
    payload: CollateralUpdate,
    db: Session = Depends(get_db),
) -> Collateral:
    item = db.query(Collateral).filter(Collateral.id == collateral_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collateral with id {collateral_id} not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(item, field, val)

    item.eligible_value_inr = _compute_collateral_eligible_value(
        item.collateral_type,
        item.ownership_status,
        item.market_value_inr,
        item.existing_encumbrance_inr,
    )

    db.commit()
    db.refresh(item)
    return item


@collateral_item_router.delete(
    "/{collateral_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete single collateral",
)
@collaterals_item_plural_router.delete(
    "/{collateral_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    include_in_schema=False,
)
def delete_collateral(
    collateral_id: int,
    db: Session = Depends(get_db),
) -> None:
    item = db.query(Collateral).filter(Collateral.id == collateral_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collateral with id {collateral_id} not found",
        )
    db.delete(item)
    db.commit()
