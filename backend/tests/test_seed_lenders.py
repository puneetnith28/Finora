"""Unit tests for demo lender seed data."""

import pytest

from app.db.base import Base
from app.db.seed_lenders import DEMO_LENDERS_DATA, seed_demo_lenders
from app.db.session import SessionLocal, engine
from app.models.lender import Lender


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_seed_demo_lenders() -> None:
    db = SessionLocal()
    try:
        seeded = seed_demo_lenders(db)
        assert len(seeded) == len(DEMO_LENDERS_DATA)

        # Check that each lender has criteria and is labelled as demo criteria
        for lender in seeded:
            assert lender.active is True
            assert "Demo lender criteria" in (lender.description or "")
            assert "For assessment demonstration only" in (lender.description or "")
            assert len(lender.criteria) > 0

        # Test idempotency (seeding again returns existing records without duplication)
        second_run = seed_demo_lenders(db)
        assert len(second_run) == len(DEMO_LENDERS_DATA)
        total_lenders = db.query(Lender).count()
        assert total_lenders == len(DEMO_LENDERS_DATA)
    finally:
        db.close()
