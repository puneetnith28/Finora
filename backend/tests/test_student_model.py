"""Tests for Student SQLAlchemy model and Pydantic schemas."""

import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.student import Student
from app.schemas.student import StudentCreate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_student_model():
    """Verify Student model creation and attribute persistence."""
    db = SessionLocal()
    try:
        student = Student(
            name="Aarav Sharma",
            email="aarav.sharma@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Northeastern University",
            target_course="MS in Computer Science",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        assert student.id is not None
        assert student.name == "Aarav Sharma"
        assert student.email == "aarav.sharma@example.com"
        assert student.country_of_origin == "India"
        assert student.target_country == "USA"
        assert student.target_university == "Northeastern University"
        assert student.target_course == "MS in Computer Science"
        assert student.created_at is not None
        assert student.updated_at is not None
    finally:
        db.close()


def test_student_unique_email_constraint():
    """Verify unique constraint on student email."""
    db = SessionLocal()
    try:
        student1 = Student(
            name="Student One",
            email="unique@example.com",
            country_of_origin="India",
            target_country="UK",
            target_university="Imperial College London",
            target_course="MSc Advanced Computing",
        )
        db.add(student1)
        db.commit()

        student2 = Student(
            name="Student Two",
            email="unique@example.com",
            country_of_origin="India",
            target_country="Canada",
            target_university="University of Toronto",
            target_course="MSc Applied Computing",
        )
        db.add(student2)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
    finally:
        db.close()


def test_student_schemas():
    """Verify Student Pydantic schema validation."""
    valid_data = {
        "name": "Priya Patel",
        "email": "priya.patel@example.com",
        "country_of_origin": "India",
        "target_country": "Germany",
        "target_university": "TU Munich",
        "target_course": "MSc Informatics",
    }
    schema = StudentCreate(**valid_data)
    assert schema.name == "Priya Patel"
    assert schema.email == "priya.patel@example.com"

    invalid_data = {**valid_data, "email": "not-a-valid-email"}
    with pytest.raises(ValidationError):
        StudentCreate(**invalid_data)
