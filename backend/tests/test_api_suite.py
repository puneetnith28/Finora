"""Comprehensive API test suite covering edge cases, validations, and calculation consistency."""

from decimal import Decimal

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


def test_missing_resource_404_responses(client: TestClient) -> None:
    """Verify consistent 404 error responses across all missing sub-resources."""
    # Non-existent student study plan
    res1 = client.get("/api/students/999/study-plan")
    assert res1.status_code == 404
    assert res1.json()["error"]["code"] == "NOT_FOUND"

    # Non-existent student funding
    res2 = client.get("/api/students/999/funding")
    assert res2.status_code == 404

    # Non-existent student financial profile
    res3 = client.get("/api/students/999/financial-profile")
    assert res3.status_code == 404

    # Non-existent student collateral
    res4 = client.get("/api/students/999/collaterals")
    assert res4.status_code == 404

    # Non-existent student assessments
    res5 = client.get("/api/students/999/assessments")
    assert res5.status_code == 404

    # Non-existent lender
    res6 = client.get("/api/lenders/99999")
    assert res6.status_code == 404


def test_calculation_consistency_via_api(client: TestClient) -> None:
    """Verify calculation consistency when creating study plan, funding, finances, and collateral."""
    # 1. Create Student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Arjun Singhal",
            "email": "arjun.singhal@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "UC Berkeley",
            "target_course": "MIMS",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add Study Plan (EUR 30,000 tuition @ 92.00 rate)
    sp_res = client.post(
        f"/api/students/{student_id}/study-plan",
        json={
            "tuition_fee": "30000.00",
            "living_expenses": "10000.00",
            "travel_expenses": "2000.00",
            "other_expenses": "1000.00",
            "currency": "EUR",
            "duration_months": 24,
            "exchange_rate_to_inr": "92.00",
        },
    )
    assert sp_res.status_code == 201
    # 43,000 EUR * 92 = 3,956,000 INR
    assert Decimal(str(sp_res.json()["total_cost_inr"])) == Decimal("3956000.00")

    # 3. Add Funding (USD 10,000 @ 85.00 = 850,000 INR)
    fund_res = client.post(
        f"/api/students/{student_id}/funding",
        json={
            "source_type": "scholarship",
            "amount_original": "10000.00",
            "currency": "USD",
            "exchange_rate_to_inr": "85.00",
            "verified": True,
        },
    )
    assert fund_res.status_code == 201
    assert Decimal(str(fund_res.json()["amount_inr"])) == Decimal("850000.00")

    # 4. Add Financial Profile & Asset
    client.post(
        f"/api/students/{student_id}/assets",
        json={
            "asset_type": "gold",
            "estimated_value_inr": "600000.00",
            "is_liquid": True,
        },
    )
    client.post(
        f"/api/students/{student_id}/financial-profile",
        json={
            "monthly_income": "120000.00",
            "existing_monthly_obligations": "10000.00",
        },
    )

    # 5. Run Assessment
    assess_res = client.post(f"/api/students/{student_id}/assessments", json={})
    assert assess_res.status_code == 201
    rep = assess_res.json()

    # Total cost = 3,956,000; Total funding = 850,000 -> Gap = 3,106,000
    assert Decimal(str(rep["financial_summary"]["study_cost"]["total_cost_inr"])) == Decimal(
        "3956000.00"
    )
    assert Decimal(str(rep["financial_summary"]["funding"]["total_funding_inr"])) == Decimal(
        "850000.00"
    )
    assert Decimal(str(rep["financial_summary"]["funding_gap"]["funding_gap_inr"])) == Decimal(
        "3106000.00"
    )
    assert Decimal(str(rep["financial_summary"]["net_worth"]["net_worth_inr"])) == Decimal(
        "600000.00"
    )
