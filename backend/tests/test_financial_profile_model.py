"""Tests for FinancialProfile SQLAlchemy model and Pydantic schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.financial_profile import FinancialProfile
from app.models.student import Student
from app.schemas.financial_profile import FinancialProfileCreate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_financial_profile():
    """Verify FinancialProfile creation, relationship with Student, and decimal persistence."""
    db = SessionLocal()
    try:
        student = Student(
            name="Siddharth Rao",
            email="siddharth.rao@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Columbia University",
            target_course="MS in Financial Engineering",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        profile = FinancialProfile(
            student_id=student.id,
            monthly_income=Decimal("150000.00"),
            existing_monthly_obligations=Decimal("25000.00"),
            monthly_living_expenses=Decimal("40000.00"),
            requested_loan_amount=Decimal("4000000.00"),
            loan_tenure_months=120,
            loan_interest_rate=Decimal("10.5000"),
            proposed_emi=Decimal("54089.00"),
            foir=Decimal("0.5273"),
            total_assets_inr=Decimal("6500000.00"),
            total_liabilities_inr=Decimal("1200000.00"),
            net_worth_inr=Decimal("5300000.00"),
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        assert profile.id is not None
        assert profile.student_id == student.id
        assert profile.monthly_income == Decimal("150000.00")
        assert profile.foir == Decimal("0.5273")
        assert profile.net_worth_inr == Decimal("5300000.00")
        assert student.financial_profile is not None
        assert student.financial_profile.id == profile.id
    finally:
        db.close()


def test_financial_profile_schema_validation():
    """Verify FinancialProfile schema validation."""
    valid_data = {
        "student_id": 1,
        "monthly_income": 120000,
        "existing_monthly_obligations": 10000,
        "monthly_living_expenses": 30000,
        "requested_loan_amount": 3000000,
        "loan_tenure_months": 120,
        "loan_interest_rate": 10.25,
        "proposed_emi": 40100,
        "foir": 0.4175,
        "total_assets_inr": 5000000,
        "total_liabilities_inr": 500000,
        "net_worth_inr": 4500000,
    }
    schema = FinancialProfileCreate(**valid_data)
    assert schema.monthly_income == Decimal("120000")
    assert schema.loan_tenure_months == 120

    # Negative income should fail
    with pytest.raises(ValidationError):
        FinancialProfileCreate(**{**valid_data, "monthly_income": -1000})
