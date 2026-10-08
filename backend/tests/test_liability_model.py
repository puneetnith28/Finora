"""Tests for Liability SQLAlchemy model and Pydantic schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.liability import Liability, LiabilityType
from app.models.student import Student
from app.schemas.liability import LiabilityCreate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_liabilities_for_student():
    """Verify creating multiple liabilities for a student."""
    db = SessionLocal()
    try:
        student = Student(
            name="Meera Iyer",
            email="meera.iyer@example.com",
            country_of_origin="India",
            target_country="Canada",
            target_university="McGill University",
            target_course="Master of Management",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        lib1 = Liability(
            student_id=student.id,
            liability_type=LiabilityType.PERSONAL_LOAN,
            lender_name="ICICI Bank",
            outstanding_amount_inr=Decimal("250000.00"),
            monthly_emi_inr=Decimal("12000.00"),
        )
        lib2 = Liability(
            student_id=student.id,
            liability_type=LiabilityType.CREDIT_CARD,
            lender_name="HDFC Card",
            outstanding_amount_inr=Decimal("50000.00"),
            monthly_emi_inr=Decimal("5000.00"),
        )
        db.add_all([lib1, lib2])
        db.commit()
        db.refresh(student)

        assert len(student.liabilities) == 2
        total_outstanding = sum(liab.outstanding_amount_inr for liab in student.liabilities)
        assert total_outstanding == Decimal("300000.00")

        total_monthly_emi = sum(liab.monthly_emi_inr for liab in student.liabilities)
        assert total_monthly_emi == Decimal("17000.00")
    finally:
        db.close()


def test_liability_schema_validation():
    """Verify Liability schema validation rules."""
    valid_data = {
        "student_id": 1,
        "liability_type": "vehicle_loan",
        "lender_name": "SBI",
        "outstanding_amount_inr": 400000,
        "monthly_emi_inr": 9500,
    }
    schema = LiabilityCreate(**valid_data)
    assert schema.liability_type == LiabilityType.VEHICLE_LOAN
    assert schema.monthly_emi_inr == Decimal("9500")

    # Invalid liability type
    with pytest.raises(ValidationError):
        LiabilityCreate(**{**valid_data, "liability_type": "gambling_debt"})
