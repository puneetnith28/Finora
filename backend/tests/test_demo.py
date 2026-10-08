"""Unit & integration test for the demo seed endpoint."""

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import engine
from app.main import app


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_seed_demo_scenarios_endpoint(client: TestClient):
    """Verify POST /api/demo/seed seeds all 5 sample scenarios and returns valid reports."""
    res = client.post("/api/demo/seed")
    assert res.status_code == 201
    data = res.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 5

    first = data["scenarios"][0]
    assert first["name"] == "Aarav Mehta (Tier-1 Prime Approval)"
    assert first["readiness_score"] >= 75
    assert "matching_lenders_count" in first

