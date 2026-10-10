"""Tests for FundingSource SQLAlchemy model and Pydantic schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.funding_source import FundingSource, FundingSourceType
from app.models.student import Student
from app.schemas.funding_source import FundingSourceCreate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_multiple_funding_sources():
    """Verify creating multiple funding sources for a student."""
    db = SessionLocal()
    try:
        student = Student(
            name="Vikram Seth",
            email="vikram.seth@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Stanford",
            target_course="MS EE",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        # Add savings
        source1 = FundingSource(
            student_id=student.id,
            source_type=FundingSourceType.SAVINGS,
            amount_original=Decimal("1500000.00"),
            currency="INR",
            exchange_rate_to_inr=Decimal("1.00"),
            amount_inr=Decimal("1500000.00"),
            verified=True,
        )
        # Add scholarship
        source2 = FundingSource(
            student_id=student.id,
            source_type=FundingSourceType.SCHOLARSHIP,
            amount_original=Decimal("10000.00"),
            currency="USD",
            exchange_rate_to_inr=Decimal("83.50"),
            amount_inr=Decimal("835000.00"),
            verified=False,
        )
        db.add_all([source1, source2])
        db.commit()
        db.refresh(student)

        assert len(student.funding_sources) == 2
        types = {fs.source_type for fs in student.funding_sources}
        assert FundingSourceType.SAVINGS in types
        assert FundingSourceType.SCHOLARSHIP in types

        total_inr = sum(fs.amount_inr for fs in student.funding_sources)
        assert total_inr == Decimal("2335000.00")
    finally:
        db.close()


def test_funding_source_schema_validation():
    """Verify FundingSource schema validation."""
    valid_data = {
        "student_id": 1,
        "source_type": "family_support",
        "amount_original": 500000,
        "currency": "INR",
        "exchange_rate_to_inr": 1.0,
        "amount_inr": 500000,
        "verified": True,
    }
    schema = FundingSourceCreate(**valid_data)
    assert schema.source_type == FundingSourceType.FAMILY_SUPPORT

    # Invalid source type
    with pytest.raises(ValidationError):
        FundingSourceCreate(**{**valid_data, "source_type": "lottery"})


def test_all_enum_types_valid():
    """Verify all FundingSourceType values are valid in FundingSourceCreate."""
    for ftype in FundingSourceType:
        data = {
            "student_id": 1,
            "source_type": ftype.value,
            "amount_original": 100000,
            "currency": "INR",
            "exchange_rate_to_inr": 1.0,
            "amount_inr": 100000,
            "verified": True,
        }
        schema = FundingSourceCreate(**data)
        assert schema.source_type == ftype

