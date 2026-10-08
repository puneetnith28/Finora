"""Unit tests for Assessment, AssessmentResult, AssessmentRuleResult models and schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.assessment import (
    Assessment,
    AssessmentResult,
    AssessmentRuleResult,
    AssessmentStatus,
)
from app.models.lender import CriterionOperator, CriterionType, Lender, LenderCriterion
from app.models.student import Student
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentResultBase,
    AssessmentRuleResultBase,
    AssessmentUpdate,
)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_assessment_and_results() -> None:
    db = SessionLocal()
    try:
        student = Student(
            name="Siddharth Rao",
            email="siddharth.assessment@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Columbia University",
            target_course="MS in Financial Engineering",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        lender = Lender(
            name="Axis Bank Education Loan",
            description="Leading Indian private sector bank",
            active=True,
        )
        db.add(lender)
        db.commit()
        db.refresh(lender)

        criterion = LenderCriterion(
            lender_id=lender.id,
            criterion_type=CriterionType.MAX_FOIR,
            operator=CriterionOperator.LTE,
            threshold_value=Decimal("0.60"),
            required=True,
        )
        db.add(criterion)
        db.commit()
        db.refresh(criterion)

        assessment = Assessment(
            student_id=student.id,
            requested_loan_amount=Decimal("4500000.00"),
            status=AssessmentStatus.COMPLETED,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        result = AssessmentResult(
            assessment_id=assessment.id,
            total_study_cost=Decimal("6000000.00"),
            available_funding=Decimal("1500000.00"),
            funding_gap=Decimal("4500000.00"),
            net_worth=Decimal("8000000.00"),
            foir=Decimal("0.4200"),
            ltv=Decimal("0.5625"),
            readiness_score=Decimal("84.50"),
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        rule_result = AssessmentRuleResult(
            assessment_result_id=result.id,
            lender_id=lender.id,
            criterion_id=criterion.id,
            passed=True,
            actual_value="0.4200",
            expected_value="<= 0.60",
            reason="FOIR is within safe underwriting threshold",
        )
        db.add(rule_result)
        db.commit()
        db.refresh(assessment)

        assert assessment.id is not None
        assert assessment.status == AssessmentStatus.COMPLETED
        assert len(assessment.results) == 1
        assert assessment.results[0].readiness_score == Decimal("84.50")
        assert len(assessment.results[0].rule_results) == 1
        assert assessment.results[0].rule_results[0].passed is True
        assert assessment.student.name == "Siddharth Rao"
    finally:
        db.close()


def test_assessment_cascade_delete() -> None:
    db = SessionLocal()
    try:
        student = Student(
            name="Deepa Cascade",
            email="deepa.cascade@example.com",
            country_of_origin="India",
            target_country="Ireland",
            target_university="Trinity College Dublin",
            target_course="MSc Data Science",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        assessment = Assessment(
            student_id=student.id,
            requested_loan_amount=Decimal("3000000.00"),
            status=AssessmentStatus.PENDING,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        assessment_id = assessment.id

        db.delete(student)
        db.commit()

        deleted = db.query(Assessment).filter_by(id=assessment_id).first()
        assert deleted is None
    finally:
        db.close()


def test_assessment_schemas() -> None:
    create_schema = AssessmentCreate(
        student_id=1,
        requested_loan_amount=Decimal("4000000.00"),
        status=AssessmentStatus.PENDING,
    )
    assert create_schema.student_id == 1
    assert create_schema.requested_loan_amount == Decimal("4000000.00")

    rule_base = AssessmentRuleResultBase(
        lender_id=1,
        passed=True,
        actual_value="750",
        expected_value=">= 650",
        reason="CIBIL verified",
    )
    assert rule_base.passed is True

    result_base = AssessmentResultBase(
        total_study_cost=Decimal("5000000.00"),
        available_funding=Decimal("1000000.00"),
        funding_gap=Decimal("4000000.00"),
        readiness_score=Decimal("92.00"),
    )
    assert result_base.readiness_score == Decimal("92.00")

    update_schema = AssessmentUpdate(
        status=AssessmentStatus.COMPLETED,
    )
    assert update_schema.status == AssessmentStatus.COMPLETED

    with pytest.raises(ValidationError):
        AssessmentResultBase(
            readiness_score=Decimal("150.00"),  # exceeds max 100
        )
