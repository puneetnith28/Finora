"""Comprehensive end-to-end API integration tests covering full lifecycle and error validations."""

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.seed_lenders import seed_demo_lenders
from app.db.session import SessionLocal, engine
from app.main import app


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_lenders(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_complete_candidate_lifecycle_and_assessment_flow(client: TestClient):
    """Test full multi-step lifecycle: student -> study plan -> funding -> profile -> collateral -> assessment -> comparison."""
    # 1. Create Student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Devika Ranganathan",
            "email": "devika.r@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "Stanford University",
            "target_course": "MS in Artificial Intelligence",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add Study Plan
    sp_res = client.post(
        f"/api/students/{student_id}/study-plan",
        json={
            "tuition_fee": "55000.00",
            "living_expenses": "20000.00",
            "currency": "USD",
            "duration_months": 24,
            "exchange_rate_to_inr": "85.00",
        },
    )
    assert sp_res.status_code == 201

    # 3. Add Funding Sources
    fund1 = client.post(
        f"/api/students/{student_id}/funding",
        json={
            "source_type": "savings",
            "amount_original": "1500000.00",
            "currency": "INR",
            "verified": True,
        },
    )
    assert fund1.status_code == 201

    fund2 = client.post(
        f"/api/students/{student_id}/funding",
        json={
            "source_type": "scholarship",
            "amount_original": "10000.00",
            "currency": "USD",
            "exchange_rate_to_inr": "85.00",
            "verified": True,
        },
    )
    assert fund2.status_code == 201

    # 4. Add Financial Profile with Assets and Liabilities
    fp_res = client.post(
        f"/api/students/{student_id}/financial-profile",
        json={
            "monthly_income": "180000.00",
            "existing_monthly_obligations": "15000.00",
        },
    )
    assert fp_res.status_code == 201

    # Add Asset
    asset_res = client.post(
        f"/api/students/{student_id}/assets",
        json={
            "asset_type": "savings_deposit",
            "estimated_value_inr": "1500000.00",
            "is_liquid": True,
        },
    )
    assert asset_res.status_code == 201

    # Add Liability
    liab_res = client.post(
        f"/api/students/{student_id}/liabilities",
        json={
            "liability_type": "vehicle_loan",
            "outstanding_amount_inr": "300000.00",
            "monthly_emi_inr": "12000.00",
        },
    )
    assert liab_res.status_code == 201

    # 5. Add Collateral
    collat_res = client.post(
        f"/api/students/{student_id}/collaterals",
        json={
            "collateral_type": "property",
            "market_value_inr": "7500000.00",
        },
    )
    assert collat_res.status_code == 201

    # 6. Run First Assessment
    res_run1 = client.post(f"/api/students/{student_id}/assessments", json={})
    assert res_run1.status_code == 201
    data1 = res_run1.json()
    assert data1["status"] == "completed"
    assert data1["financial_summary"]["study_cost"]["total_cost_inr"] == "6375000.00"
    assessment_id_1 = data1["assessment_id"]

    # 7. Run Second Assessment with Lower Requested Loan Override
    res_run2 = client.post(
        f"/api/students/{student_id}/assessments",
        json={"requested_loan_amount_inr": "3500000.00"},
    )
    assert res_run2.status_code == 201
    assessment_id_2 = res_run2.json()["assessment_id"]

    # 8. Compare Two Assessment Runs
    res_cmp = client.get(
        f"/api/assessments/compare?base_id={assessment_id_1}&target_id={assessment_id_2}"
    )
    assert res_cmp.status_code == 200
    cmp_data = res_cmp.json()
    assert cmp_data["baseline_assessment_id"] == assessment_id_1
    assert cmp_data["target_assessment_id"] == assessment_id_2

    # 9. List and Get Single Assessment
    list_res = client.get(f"/api/students/{student_id}/assessments")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 2

    get_res = client.get(f"/api/assessments/{assessment_id_1}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == assessment_id_1


def test_input_validation_error_responses(client: TestClient):
    """Test standardized 422 error payloads for invalid formats."""
    # Negative tuition fee
    res = client.post(
        "/api/students/1/study-plan",
        json={
            "tuition_fee": "-5000.00",
            "living_expenses": "10000.00",
            "currency": "USD",
        },
    )
    assert res.status_code == 422
    assert "error" in res.json()

    # Invalid email on student create
    res2 = client.post(
        "/api/students",
        json={
            "name": "Invalid Email Student",
            "email": "not-a-valid-email",
            "target_country": "USA",
            "target_university": "Harvard",
            "target_course": "MBA",
        },
    )
    assert res2.status_code == 422
