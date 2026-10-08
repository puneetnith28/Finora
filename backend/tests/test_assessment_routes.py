"""Unit and API tests for Assessment endpoints."""

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


def test_assessment_api_execution_and_retrieval(client: TestClient) -> None:
    # 1. Create student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Tanvi Joshi",
            "email": "tanvi.joshi@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "Georgia Tech",
            "target_course": "MS in Cybersecurity",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add study plan
    sp_res = client.post(
        f"/api/students/{student_id}/study-plan",
        json={
            "tuition_fee": "35000.00",
            "living_expenses": "15000.00",
            "currency": "USD",
            "duration_months": 24,
            "exchange_rate_to_inr": "85.00",
        },
    )
    assert sp_res.status_code == 201

    # 3. Add funding (Savings: 10,00,000 INR)
    fund_res = client.post(
        f"/api/students/{student_id}/funding",
        json={
            "source_type": "savings",
            "amount_original": "1000000.00",
            "currency": "INR",
            "verified": True,
        },
    )
    assert fund_res.status_code == 201

    # 4. Add financial profile (Income: 90,000 INR)
    prof_res = client.post(
        f"/api/students/{student_id}/financial-profile",
        json={
            "monthly_income": "90000.00",
            "existing_monthly_obligations": "5000.00",
        },
    )
    assert prof_res.status_code == 201

    # 5. Add Collateral (Property: 40,00,000 INR)
    collat_res = client.post(
        f"/api/students/{student_id}/collateral",
        json={
            "collateral_type": "property",
            "market_value_inr": "4000000.00",
        },
    )
    assert collat_res.status_code == 201

    # 6. Run Assessment via POST /api/students/{id}/assessments
    res_run = client.post(f"/api/students/{student_id}/assessments", json={})
    assert res_run.status_code == 201
    data = res_run.json()
    assert data["assessment_id"] is not None
    assert data["student_id"] == student_id
    assert data["status"] == "completed"

    # Verify calculated financial summary
    assert Decimal(str(data["financial_summary"]["study_cost"]["total_cost_inr"])) == Decimal(
        "4250000.00"
    )
    assert Decimal(str(data["financial_summary"]["funding_gap"]["funding_gap_inr"])) == Decimal(
        "3250000.00"
    )

    # Verify lender evaluations
    assert len(data["lender_evaluations"]) >= 4
    for l_eval in data["lender_evaluations"]:
        assert l_eval["outcome_state"] in ["potential_match", "needs_review", "not_a_match"]
        assert len(l_eval["rule_results"]) > 0

    assessment_id = data["assessment_id"]

    # 7. List assessments for student
    res_list = client.get(f"/api/students/{student_id}/assessments")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 8. Get single assessment by ID
    res_get = client.get(f"/api/assessments/{assessment_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == assessment_id

    # 9. Run a second assessment with an override loan amount to test comparison
    res_run2 = client.post(
        f"/api/students/{student_id}/assessments",
        json={"requested_loan_amount_inr": "2500000.00"},
    )
    assert res_run2.status_code == 201
    assessment_id_2 = res_run2.json()["assessment_id"]

    # 10. Compare two assessments
    res_cmp = client.get(f"/api/assessments/compare?base_id={assessment_id}&target_id={assessment_id_2}")
    assert res_cmp.status_code == 200
    cmp_data = res_cmp.json()
    assert cmp_data["baseline_assessment_id"] == assessment_id
    assert cmp_data["target_assessment_id"] == assessment_id_2
    assert "readiness_score" in cmp_data
    assert "foir" in cmp_data
    assert "summary_insight" in cmp_data

