"""Tests for Asset SQLAlchemy model and Pydantic schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.asset import Asset, AssetType
from app.models.student import Student
from app.schemas.asset import AssetCreate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_assets_for_student():
    """Verify creating various assets associated with a student."""
    db = SessionLocal()
    try:
        student = Student(
            name="Deepak Chopra",
            email="deepak.chopra@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="UC Berkeley",
            target_course="Master of Engineering",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        asset1 = Asset(
            student_id=student.id,
            asset_type=AssetType.FIXED_DEPOSIT,
            description="HDFC Bank 3-year term deposit",
            estimated_value_inr=Decimal("1200000.00"),
            is_liquid=True,
        )
        asset2 = Asset(
            student_id=student.id,
            asset_type=AssetType.PROPERTY,
            description="Residential apartment in Bangalore",
            estimated_value_inr=Decimal("6500000.00"),
            is_liquid=False,
        )
        db.add_all([asset1, asset2])
        db.commit()
        db.refresh(student)

        assert len(student.assets) == 2
        total_assets = sum(a.estimated_value_inr for a in student.assets)
        assert total_assets == Decimal("7700000.00")

        liquid_assets = [a for a in student.assets if a.is_liquid]
        assert len(liquid_assets) == 1
        assert liquid_assets[0].asset_type == AssetType.FIXED_DEPOSIT
    finally:
        db.close()


def test_asset_schema_validation():
    """Verify Asset schema validation rules."""
    valid_data = {
        "student_id": 1,
        "asset_type": "gold",
        "description": "Gold coins 100g",
        "estimated_value_inr": 720000,
        "is_liquid": True,
    }
    schema = AssetCreate(**valid_data)
    assert schema.asset_type == AssetType.GOLD
    assert schema.is_liquid is True

    # Invalid asset type
    with pytest.raises(ValidationError):
        AssetCreate(**{**valid_data, "asset_type": "crypto_token_unsupported"})
