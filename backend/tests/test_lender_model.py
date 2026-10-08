"""Unit tests for Lender and LenderCriterion models and schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.lender import CriterionOperator, CriterionType, Lender, LenderCriterion
from app.schemas.lender import (
    LenderCreate,
    LenderCriterionBase,
    LenderCriterionCreate,
    LenderUpdate,
)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_lender_with_criteria() -> None:
    db = SessionLocal()
    try:
        lender = Lender(
            name="HDFC Credila",
            description="Specialized higher education loan provider in India",
            active=True,
        )
        db.add(lender)
        db.commit()
        db.refresh(lender)

        c1 = LenderCriterion(
            lender_id=lender.id,
            criterion_type=CriterionType.MIN_CIBIL,
            operator=CriterionOperator.GTE,
            threshold_value=Decimal("680.00"),
            required=True,
            weight=Decimal("1.50"),
        )
        c2 = LenderCriterion(
            lender_id=lender.id,
            criterion_type=CriterionType.MAX_FOIR,
            operator=CriterionOperator.LTE,
            threshold_value=Decimal("0.65"),
            required=True,
            weight=Decimal("1.00"),
        )
        c3 = LenderCriterion(
            lender_id=lender.id,
            criterion_type=CriterionType.TARGET_COUNTRY,
            operator=CriterionOperator.IN,
            threshold_text="USA,UK,Canada,Germany,Australia",
            required=True,
            weight=Decimal("1.00"),
        )
        db.add_all([c1, c2, c3])
        db.commit()
        db.refresh(lender)

        assert lender.id is not None
        assert len(lender.criteria) == 3
        cibil_rule = next(c for c in lender.criteria if c.criterion_type == CriterionType.MIN_CIBIL)
        assert cibil_rule.threshold_value == Decimal("680.00")
        assert cibil_rule.operator == CriterionOperator.GTE
    finally:
        db.close()


def test_lender_cascade_delete() -> None:
    db = SessionLocal()
    try:
        lender = Lender(
            name="Avanse Financial",
            description="Education loans for overseas studies",
            active=True,
        )
        db.add(lender)
        db.commit()
        db.refresh(lender)

        criterion = LenderCriterion(
            lender_id=lender.id,
            criterion_type=CriterionType.MAX_LOAN_AMOUNT,
            operator=CriterionOperator.LTE,
            threshold_value=Decimal("7500000.00"),
            required=False,
            weight=Decimal("1.00"),
        )
        db.add(criterion)
        db.commit()
        db.refresh(criterion)
        crit_id = criterion.id

        db.delete(lender)
        db.commit()

        deleted_crit = db.query(LenderCriterion).filter_by(id=crit_id).first()
        assert deleted_crit is None
    finally:
        db.close()


def test_lender_schemas() -> None:
    create_schema = LenderCreate(
        name="InCred Finance",
        description="NBFC education finance",
        active=True,
        criteria=[
            LenderCriterionBase(
                criterion_type=CriterionType.MIN_CIBIL,
                operator=CriterionOperator.GTE,
                threshold_value=Decimal("650.00"),
                required=True,
            )
        ],
    )
    assert create_schema.name == "InCred Finance"
    assert len(create_schema.criteria) == 1

    crit_create = LenderCriterionCreate(
        criterion_type=CriterionType.COLLATERAL_REQUIRED,
        operator=CriterionOperator.EQ,
        threshold_text="true",
        required=False,
    )
    assert crit_create.criterion_type == CriterionType.COLLATERAL_REQUIRED

    update_schema = LenderUpdate(active=False)
    assert update_schema.active is False

    with pytest.raises(ValidationError):
        LenderCriterionCreate(
            weight=Decimal("-1.0"),
        )
