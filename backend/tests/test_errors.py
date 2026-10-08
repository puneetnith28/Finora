"""Unit tests for standardized JSON error handling."""

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


def test_standardized_404_error(client: TestClient) -> None:
    res = client.get("/api/students/99999")
    assert res.status_code == 404
    body = res.json()
    assert "error" in body
    assert body["error"]["code"] == "NOT_FOUND"
    assert "Student with id 99999 not found" in body["error"]["message"]


def test_standardized_422_validation_error(client: TestClient) -> None:
    # Send invalid email and negative duration
    invalid_payload = {
        "name": "",  # min_length=1
        "email": "invalid-email-format",
    }
    res = client.post("/api/students", json=invalid_payload)
    assert res.status_code == 422
    body = res.json()
    assert "error" in body
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert "fields" in body["error"]
    assert len(body["error"]["fields"]) > 0
