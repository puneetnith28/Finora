"""Security Hardening and Review Test Suite."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.main import app
from app.models.student import Student


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_security_response_headers(client: TestClient):
    """Verify essential security response headers are returned."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("x-content-type-options") == "nosniff"
    assert res.headers.get("x-frame-options") == "DENY"
    assert res.headers.get("x-xss-protection") == "1; mode=block"
    assert res.headers.get("referrer-policy") == "strict-origin-when-cross-origin"


def test_cors_headers_allowed_origin(client: TestClient):
    """Verify CORS preflight and origin headers for allowed client domain."""
    origin = settings.BACKEND_CORS_ORIGINS[0] if settings.BACKEND_CORS_ORIGINS else "http://localhost:3000"
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    res = client.options("/api/students", headers=headers)
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == origin


def test_unhandled_error_masking(client: TestClient):
    """Verify internal server errors return uniform masked payload without stack trace leakage."""
    # Attempting to query a malformed route or intentionally triggering an unhandled exception
    res = client.get("/api/assessments/999999999")
    assert res.status_code == 404
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "traceback" not in data


def test_document_upload_extension_and_content_sanitization(client: TestClient):
    """Verify dangerous executable / invalid extensions are blocked."""
    # First create a student
    db = SessionLocal()
    st = Student(
        name="Security Test User",
        email="security@test.com",
        country_of_origin="India",
        target_country="USA",
        target_university="MIT",
        target_course="Computer Science",
    )
    db.add(st)
    db.commit()
    db.refresh(st)
    sid = st.id
    db.close()

    # Upload invalid extension
    res = client.post(
        f"/api/students/{sid}/documents",
        files={"file": ("malicious_script.sh", b"#!/bin/bash\nrm -rf /", "application/x-sh")},
        data={"document_type": "salary_slip"},
    )
    assert res.status_code == 400
    assert "not supported" in res.json()["error"]["message"].lower()

    # Upload spoofed extension with invalid magic bytes
    res_spoof = client.post(
        f"/api/students/{sid}/documents",
        files={"file": ("fake.pdf", b"NOT_A_REAL_PDF_HEADER_CONTENT", "application/pdf")},
        data={"document_type": "salary_slip"},
    )
    assert res_spoof.status_code == 400
    assert "header signature" in res_spoof.json()["error"]["message"].lower()
