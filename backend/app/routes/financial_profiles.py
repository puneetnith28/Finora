"""Financial Profile, Assets, and Liabilities API routes."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.asset import Asset, AssetType
from app.models.financial_profile import FinancialProfile
from app.models.liability import Liability, LiabilityType
from app.models.student import Student
from app.schemas.asset import AssetResponse, AssetUpdate
from app.schemas.financial_profile import FinancialProfileResponse, FinancialProfileUpdate
from app.schemas.liability import LiabilityResponse, LiabilityUpdate
from app.services.emi_calculator import EMIInput, calculate_emi
from app.services.foir_calculator import FOIRInput, calculate_foir

# Routers
financial_profile_router = APIRouter(tags=["Financial Profile"])
asset_item_router = APIRouter(prefix="/assets", tags=["Assets"])
liability_item_router = APIRouter(prefix="/liabilities", tags=["Liabilities"])


class FinancialProfileInput(BaseModel):
    monthly_income: Decimal = Field(default=Decimal("0.0"), ge=0)
    existing_monthly_obligations: Decimal = Field(default=Decimal("0.0"), ge=0)
    monthly_living_expenses: Decimal = Field(default=Decimal("0.0"), ge=0)
    requested_loan_amount: Decimal = Field(default=Decimal("0.0"), ge=0)
    loan_tenure_months: int = Field(default=120, ge=12, le=360)
    loan_interest_rate: Decimal = Field(default=Decimal("10.50"), gt=0, le=100)


class AssetInput(BaseModel):
    asset_type: AssetType
    description: str | None = None
    estimated_value_inr: Decimal = Field(default=Decimal("0.0"), ge=0)
    is_liquid: bool = Field(default=False)


class LiabilityInput(BaseModel):
    liability_type: LiabilityType
    lender_name: str | None = None
    outstanding_amount_inr: Decimal = Field(default=Decimal("0.0"), ge=0)
    monthly_emi_inr: Decimal = Field(default=Decimal("0.0"), ge=0)


def _recalculate_profile_metrics(profile: FinancialProfile, db: Session) -> None:
    """Recalculate EMI, FOIR, Total Assets, Total Liabilities, and Net Worth."""
    # Compute proposed EMI
    emi_res = calculate_emi(
        EMIInput(
            principal_inr=profile.requested_loan_amount,
            annual_interest_rate_percent=profile.loan_interest_rate,
            tenure_months=profile.loan_tenure_months,
        )
    )
    profile.proposed_emi = emi_res.monthly_emi_inr

    # Compute FOIR
    foir_res = calculate_foir(
        FOIRInput(
            monthly_net_income_inr=profile.monthly_income,
            existing_monthly_emi_inr=profile.existing_monthly_obligations,
            proposed_monthly_emi_inr=profile.proposed_emi,
        )
    )
    profile.foir = foir_res.foir_ratio

    # Calculate Assets & Liabilities totals for student
    assets = db.query(Asset).filter(Asset.student_id == profile.student_id).all()
    liabilities = db.query(Liability).filter(Liability.student_id == profile.student_id).all()

    tot_assets = sum(a.estimated_value_inr for a in assets)
    tot_liabilities = sum(liab.outstanding_amount_inr for liab in liabilities)

    profile.total_assets_inr = Decimal(str(tot_assets))
    profile.total_liabilities_inr = Decimal(str(tot_liabilities))
    profile.net_worth_inr = profile.total_assets_inr - profile.total_liabilities_inr


# ==========================================
# 1. Financial Profile Endpoints
# ==========================================

@financial_profile_router.post(
    "/students/{student_id}/financial-profile",
    response_model=FinancialProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or update student financial profile",
)
def create_financial_profile(
    student_id: int,
    payload: FinancialProfileInput,
    db: Session = Depends(get_db),
) -> FinancialProfile:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    existing = (
        db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    )
    if existing:
        existing.monthly_income = payload.monthly_income
        existing.existing_monthly_obligations = payload.existing_monthly_obligations
        existing.monthly_living_expenses = payload.monthly_living_expenses
        existing.requested_loan_amount = payload.requested_loan_amount
        existing.loan_tenure_months = payload.loan_tenure_months
        existing.loan_interest_rate = payload.loan_interest_rate
        _recalculate_profile_metrics(existing, db)
        db.commit()
        db.refresh(existing)
        return existing

    profile = FinancialProfile(
        student_id=student_id,
        monthly_income=payload.monthly_income,
        existing_monthly_obligations=payload.existing_monthly_obligations,
        monthly_living_expenses=payload.monthly_living_expenses,
        requested_loan_amount=payload.requested_loan_amount,
        loan_tenure_months=payload.loan_tenure_months,
        loan_interest_rate=payload.loan_interest_rate,
    )
    _recalculate_profile_metrics(profile, db)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@financial_profile_router.get(
    "/students/{student_id}/financial-profile",
    response_model=FinancialProfileResponse,
    summary="Get student financial profile",
)
def get_financial_profile(
    student_id: int,
    db: Session = Depends(get_db),
) -> FinancialProfile:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    profile = (
        db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial profile not found for student {student_id}",
        )
    return profile


@financial_profile_router.patch(
    "/students/{student_id}/financial-profile",
    response_model=FinancialProfileResponse,
    summary="Partially update financial profile",
)
def update_financial_profile(
    student_id: int,
    payload: FinancialProfileUpdate,
    db: Session = Depends(get_db),
) -> FinancialProfile:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    profile = (
        db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial profile not found for student {student_id}",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(profile, field, val)

    _recalculate_profile_metrics(profile, db)
    db.commit()
    db.refresh(profile)
    return profile


# ==========================================
# 2. Asset Endpoints
# ==========================================

@financial_profile_router.post(
    "/students/{student_id}/assets",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add asset for student",
)
def add_student_asset(
    student_id: int,
    payload: AssetInput,
    db: Session = Depends(get_db),
) -> Asset:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    asset = Asset(
        student_id=student_id,
        asset_type=payload.asset_type,
        description=payload.description,
        estimated_value_inr=payload.estimated_value_inr,
        is_liquid=payload.is_liquid,
    )
    db.add(asset)
    db.flush()

    # Update profile totals if present
    profile = db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    if profile:
        _recalculate_profile_metrics(profile, db)

    db.commit()
    db.refresh(asset)
    return asset


@financial_profile_router.get(
    "/students/{student_id}/assets",
    response_model=list[AssetResponse],
    summary="List all assets for student",
)
def list_student_assets(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[Asset]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    return db.query(Asset).filter(Asset.student_id == student_id).all()


@asset_item_router.patch(
    "/{asset_id}",
    response_model=AssetResponse,
    summary="Update single asset",
)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
) -> Asset:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(asset, field, val)

    profile = db.query(FinancialProfile).filter(FinancialProfile.student_id == asset.student_id).first()
    if profile:
        _recalculate_profile_metrics(profile, db)

    db.commit()
    db.refresh(asset)
    return asset


@asset_item_router.delete(
    "/{asset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete single asset",
)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
) -> None:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )
    student_id = asset.student_id
    db.delete(asset)
    db.flush()

    profile = db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    if profile:
        _recalculate_profile_metrics(profile, db)

    db.commit()


# ==========================================
# 3. Liability Endpoints
# ==========================================

@financial_profile_router.post(
    "/students/{student_id}/liabilities",
    response_model=LiabilityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add liability for student",
)
def add_student_liability(
    student_id: int,
    payload: LiabilityInput,
    db: Session = Depends(get_db),
) -> Liability:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    liability = Liability(
        student_id=student_id,
        liability_type=payload.liability_type,
        lender_name=payload.lender_name,
        outstanding_amount_inr=payload.outstanding_amount_inr,
        monthly_emi_inr=payload.monthly_emi_inr,
    )
    db.add(liability)
    db.flush()

    profile = db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    if profile:
        _recalculate_profile_metrics(profile, db)

    db.commit()
    db.refresh(liability)
    return liability


@financial_profile_router.get(
    "/students/{student_id}/liabilities",
    response_model=list[LiabilityResponse],
    summary="List all liabilities for student",
)
def list_student_liabilities(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[Liability]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    return db.query(Liability).filter(Liability.student_id == student_id).all()


@liability_item_router.patch(
    "/{liability_id}",
    response_model=LiabilityResponse,
    summary="Update single liability",
)
def update_liability(
    liability_id: int,
    payload: LiabilityUpdate,
    db: Session = Depends(get_db),
) -> Liability:
    liability = db.query(Liability).filter(Liability.id == liability_id).first()
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Liability with id {liability_id} not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(liability, field, val)

    profile = db.query(FinancialProfile).filter(FinancialProfile.student_id == liability.student_id).first()
    if profile:
        _recalculate_profile_metrics(profile, db)

    db.commit()
    db.refresh(liability)
    return liability


@liability_item_router.delete(
    "/{liability_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete single liability",
)
def delete_liability(
    liability_id: int,
    db: Session = Depends(get_db),
) -> None:
    liability = db.query(Liability).filter(Liability.id == liability_id).first()
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Liability with id {liability_id} not found",
        )
    student_id = liability.student_id
    db.delete(liability)
    db.flush()

    profile = db.query(FinancialProfile).filter(FinancialProfile.student_id == student_id).first()
    if profile:
        _recalculate_profile_metrics(profile, db)

    db.commit()
