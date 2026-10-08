"""Unit tests for Collateral model and schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.asset import Asset, AssetType
from app.models.collateral import Collateral, CollateralType, OwnershipStatus
from app.models.student import Student
from app.schemas.collateral import CollateralCreate, CollateralUpdate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_collateral_model() -> None:
    db = SessionLocal()
    try:
        student = Student(
            name="Ananya Sharma",
            email="ananya.collateral@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Carnegie Mellon University",
            target_course="MS in Software Engineering",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        asset = Asset(
            student_id=student.id,
            asset_type=AssetType.PROPERTY,
            description="Residential Apartment Bangalore",
            estimated_value_inr=Decimal("12000000.00"),
            is_liquid=False,
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)

        collateral = Collateral(
            student_id=student.id,
            asset_id=asset.id,
            collateral_type=CollateralType.PROPERTY,
            ownership_status=OwnershipStatus.JOINT_PARENT,
            description="Residential Apartment Bangalore, clear title",
            market_value_inr=Decimal("12000000.00"),
            existing_encumbrance_inr=Decimal("2000000.00"),
            eligible_value_inr=Decimal("8000000.00"),
        )
        db.add(collateral)
        db.commit()
        db.refresh(collateral)

        assert collateral.id is not None
        assert collateral.student_id == student.id
        assert collateral.asset_id == asset.id
        assert collateral.collateral_type == CollateralType.PROPERTY
        assert collateral.ownership_status == OwnershipStatus.JOINT_PARENT
        assert collateral.market_value_inr == Decimal("12000000.00")
        assert collateral.existing_encumbrance_inr == Decimal("2000000.00")
        assert collateral.eligible_value_inr == Decimal("8000000.00")
        assert collateral.student.name == "Ananya Sharma"
        assert collateral.asset.description == "Residential Apartment Bangalore"
    finally:
        db.close()


def test_collateral_cascade_delete() -> None:
    db = SessionLocal()
    try:
        student = Student(
            name="Rohan Collateral",
            email="rohan.collateral@example.com",
            country_of_origin="India",
            target_country="Germany",
            target_university="TU Munich",
            target_course="MS Informatics",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        collateral = Collateral(
            student_id=student.id,
            collateral_type=CollateralType.FIXED_DEPOSIT,
            ownership_status=OwnershipStatus.SOLE,
            description="SBI Fixed Deposit",
            market_value_inr=Decimal("2500000.00"),
            existing_encumbrance_inr=Decimal("0.00"),
            eligible_value_inr=Decimal("2250000.00"),
        )
        db.add(collateral)
        db.commit()
        db.refresh(collateral)
        collateral_id = collateral.id

        db.delete(student)
        db.commit()

        deleted = db.query(Collateral).filter_by(id=collateral_id).first()
        assert deleted is None
    finally:
        db.close()


def test_collateral_schemas() -> None:
    create_schema = CollateralCreate(
        collateral_type=CollateralType.GOLD,
        ownership_status=OwnershipStatus.SOLE,
        description="Sovereign Gold Bonds & Jewellery",
        market_value_inr=Decimal("1500000.00"),
        existing_encumbrance_inr=Decimal("0.00"),
        eligible_value_inr=Decimal("1125000.00"),
    )
    assert create_schema.collateral_type == CollateralType.GOLD
    assert create_schema.eligible_value_inr == Decimal("1125000.00")

    update_schema = CollateralUpdate(
        eligible_value_inr=Decimal("1200000.00"),
        description="Updated evaluation",
    )
    assert update_schema.eligible_value_inr == Decimal("1200000.00")
    assert update_schema.description == "Updated evaluation"

    with pytest.raises(ValidationError):
        CollateralCreate(
            market_value_inr=Decimal("-100.00"),
        )
