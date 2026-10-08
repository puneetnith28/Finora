"""Tests for StudyPlan SQLAlchemy model and Pydantic schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.student import Student
from app.models.study_plan import StudyPlan
from app.schemas.study_plan import StudyPlanCreate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_study_plan_with_student():
    """Verify StudyPlan creation, relationship with Student, and decimal persistence."""
    db = SessionLocal()
    try:
        student = Student(
            name="Rohan Verma",
            email="rohan.verma@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Carnegie Mellon University",
            target_course="MS in Software Engineering",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        plan = StudyPlan(
            student_id=student.id,
            tuition_fee=Decimal("60000.00"),
            living_expenses=Decimal("20000.00"),
            travel_expenses=Decimal("2500.00"),
            other_expenses=Decimal("1500.00"),
            currency="USD",
            duration_months=24,
            exchange_rate_to_inr=Decimal("83.50"),
            total_cost_original=Decimal("84000.00"),
            total_cost_inr=Decimal("7014000.00"),
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        assert plan.id is not None
        assert plan.student_id == student.id
        assert plan.currency == "USD"
        assert plan.total_cost_original == Decimal("84000.00")
        assert plan.total_cost_inr == Decimal("7014000.00")
        assert plan.student.name == "Rohan Verma"
        assert student.study_plan is not None
        assert student.study_plan.id == plan.id
    finally:
        db.close()


def test_study_plan_cascade_delete():
    """Verify deleting a student cascades and deletes their study plan."""
    db = SessionLocal()
    try:
        student = Student(
            name="Ananya Roy",
            email="ananya.roy@example.com",
            country_of_origin="India",
            target_country="UK",
            target_university="Oxford",
            target_course="MSc CS",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        plan = StudyPlan(
            student_id=student.id,
            tuition_fee=Decimal("30000.00"),
            currency="GBP",
            duration_months=12,
            exchange_rate_to_inr=Decimal("105.00"),
            total_cost_original=Decimal("30000.00"),
            total_cost_inr=Decimal("3150000.00"),
        )
        db.add(plan)
        db.commit()

        # Delete student
        db.delete(student)
        db.commit()

        # Study plan should be deleted
        remaining_plan = db.query(StudyPlan).filter(StudyPlan.student_id == student.id).first()
        assert remaining_plan is None
    finally:
        db.close()


def test_study_plan_schema_validation():
    """Verify StudyPlan schema validation rules."""
    valid_data = {
        "student_id": 1,
        "tuition_fee": 50000,
        "living_expenses": 15000,
        "travel_expenses": 2000,
        "other_expenses": 1000,
        "currency": "USD",
        "duration_months": 24,
        "exchange_rate_to_inr": 83.5,
        "total_cost_original": 68000,
        "total_cost_inr": 5678000,
    }
    schema = StudyPlanCreate(**valid_data)
    assert schema.currency == "USD"
    assert schema.duration_months == 24

    # Negative tuition fee should fail
    with pytest.raises(ValidationError):
        StudyPlanCreate(**{**valid_data, "tuition_fee": -500})
