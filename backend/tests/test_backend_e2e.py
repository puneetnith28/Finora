"""Complete End-to-End Backend Journey Acceptance Test.

Verifies the entire lifecycle:
Create student -> create study plan -> add funding -> add financial profile
-> add asset -> add liability -> add collateral -> run assessment -> retrieve assessment.
"""

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


def test_complete_backend_end_to_end_journey(client: TestClient) -> None:
    """Execute and assert the complete 9-step backend workflow end-to-end."""
    # -------------------------------------------------------------
    # Step 1: Create Student
    # -------------------------------------------------------------
    student_payload = {
        "name": "Isha Verma",
        "email": "isha.verma@example.com",
        "country_of_origin": "India",
        "target_country": "USA",
        "target_university": "University of Washington",
        "target_course": "MS in Computer Science & Systems",
    }
    res_st = client.post("/api/students", json=student_payload)
    assert res_st.status_code == 201
    st_data = res_st.json()
    assert st_data["id"] is not None
    assert st_data["name"] == "Isha Verma"
    student_id = st_data["id"]

    # -------------------------------------------------------------
    # Step 2: Create Study Plan
    # Tuition: $48,000, Living: $18,000, Travel: $2,000, Other: $2,000
    # Total = $70,000 @ 85.00 INR/USD = 5,950,000 INR
    # -------------------------------------------------------------
    sp_payload = {
        "tuition_fee": "48000.00",
        "living_expenses": "18000.00",
        "travel_expenses": "2000.00",
        "other_expenses": "2000.00",
        "currency": "USD",
        "duration_months": 24,
        "exchange_rate_to_inr": "85.00",
    }
    res_sp = client.post(f"/api/students/{student_id}/study-plan", json=sp_payload)
    assert res_sp.status_code == 201
    sp_data = res_sp.json()
    assert Decimal(str(sp_data["total_cost_original"])) == Decimal("70000.00")
    assert Decimal(str(sp_data["total_cost_inr"])) == Decimal("5950000.00")

    # -------------------------------------------------------------
    # Step 3: Add Funding Sources
    # Source A: Family Savings = 12,00,000 INR
    # Source B: Merit Scholarship = $5,000 USD @ 85.00 = 425,000 INR
    # Total Funding = 1,625,000 INR
    # -------------------------------------------------------------
    fund_a = {
        "source_type": "savings",
        "amount_original": "1200000.00",
        "currency": "INR",
        "verified": True,
    }
    res_fa = client.post(f"/api/students/{student_id}/funding", json=fund_a)
    assert res_fa.status_code == 201

    fund_b = {
        "source_type": "scholarship",
        "amount_original": "5000.00",
        "currency": "USD",
        "exchange_rate_to_inr": "85.00",
        "verified": True,
    }
    res_fb = client.post(f"/api/students/{student_id}/funding", json=fund_b)
    assert res_fb.status_code == 201

    # Verify funding listing
    res_funds = client.get(f"/api/students/{student_id}/funding")
    assert res_funds.status_code == 200
    assert len(res_funds.json()) == 2

    # -------------------------------------------------------------
    # Step 4: Add Assets
    # Asset 1: Fixed Deposit = 8,00,000 INR (Liquid)
    # Asset 2: Gold = 4,00,000 INR (Liquid)
    # Total Assets = 1,200,000 INR
    # -------------------------------------------------------------
    res_as1 = client.post(
        f"/api/students/{student_id}/assets",
        json={
            "asset_type": "fixed_deposit",
            "description": "SBI FD",
            "estimated_value_inr": "800000.00",
            "is_liquid": True,
        },
    )
    assert res_as1.status_code == 201

    res_as2 = client.post(
        f"/api/students/{student_id}/assets",
        json={
            "asset_type": "gold",
            "description": "Family Gold",
            "estimated_value_inr": "400000.00",
            "is_liquid": True,
        },
    )
    assert res_as2.status_code == 201

    # -------------------------------------------------------------
    # Step 5: Add Liabilities
    # Liability 1: Personal Loan = 2,00,000 INR outstanding, 8,000 EMI
    # -------------------------------------------------------------
    res_liab = client.post(
        f"/api/students/{student_id}/liabilities",
        json={
            "liability_type": "personal_loan",
            "lender_name": "Axis Bank",
            "outstanding_amount_inr": "200000.00",
            "monthly_emi_inr": "8000.00",
        },
    )
    assert res_liab.status_code == 201

    # -------------------------------------------------------------
    # Step 6: Create Financial Profile
    # Monthly Income = 1,40,000 INR
    # Existing obligations = 8,000 INR
    # -------------------------------------------------------------
    prof_payload = {
        "monthly_income": "140000.00",
        "existing_monthly_obligations": "8000.00",
        "monthly_living_expenses": "25000.00",
        "requested_loan_amount": "4325000.00",
        "loan_tenure_months": 120,
        "loan_interest_rate": "10.50",
    }
    res_prof = client.post(
        f"/api/students/{student_id}/financial-profile", json=prof_payload
    )
    assert res_prof.status_code == 201
    prof_data = res_prof.json()
    assert Decimal(str(prof_data["total_assets_inr"])) == Decimal("1200000.00")
    assert Decimal(str(prof_data["total_liabilities_inr"])) == Decimal("200000.00")
    assert Decimal(str(prof_data["net_worth_inr"])) == Decimal("1000000.00")

    # -------------------------------------------------------------
    # Step 7: Add Collateral
    # Property = 75,00,000 INR market value, 0 encumbrance
    # Eligible = 75L * 0.80 = 60,00,000 INR
    # -------------------------------------------------------------
    res_collat = client.post(
        f"/api/students/{student_id}/collateral",
        json={
            "collateral_type": "property",
            "ownership_status": "sole",
            "description": "Family House in Pune",
            "market_value_inr": "7500000.00",
            "existing_encumbrance_inr": "0.00",
        },
    )
    assert res_collat.status_code == 201
    assert Decimal(str(res_collat.json()["eligible_value_inr"])) == Decimal("6000000.00")

    # -------------------------------------------------------------
    # Step 8: Run Assessment
    # -------------------------------------------------------------
    res_assessment = client.post(f"/api/students/{student_id}/assessments", json={})
    assert res_assessment.status_code == 201
    report = res_assessment.json()

    assert report["assessment_id"] is not None
    assert report["student_id"] == student_id
    assert report["status"] == "completed"

    fin = report["financial_summary"]
    # Study Cost = 5,950,000 INR
    assert Decimal(str(fin["study_cost"]["total_cost_inr"])) == Decimal("5950000.00")
    # Total Funding = 1,625,000 INR
    assert Decimal(str(fin["funding"]["total_funding_inr"])) == Decimal("1625000.00")
    # Funding Gap = 5,950,000 - 1,625,000 = 4,325,000 INR
    assert Decimal(str(fin["funding_gap"]["funding_gap_inr"])) == Decimal("4325000.00")
    # Net Worth = 1,000,000 INR
    assert Decimal(str(fin["net_worth"]["net_worth_inr"])) == Decimal("1000000.00")
    # Eligible Collateral = 6,000,000 INR
    assert Decimal(str(fin["collateral"]["total_eligible_value_inr"])) == Decimal("6000000.00")
    # Readiness Score computed
    assert Decimal(str(fin["readiness_score"])) > Decimal("0.00")

    # Lenders evaluated
    assert len(report["lender_evaluations"]) >= 4
    for lender in report["lender_evaluations"]:
        assert lender["outcome_state"] in ["potential_match", "needs_review", "not_a_match"]
        assert len(lender["rule_results"]) > 0
        assert "Indicative assessment based on provided data" in lender["disclaimer"]

    assessment_id = report["assessment_id"]

    # -------------------------------------------------------------
    # Step 9: Retrieve Stored Assessment
    # -------------------------------------------------------------
    res_fetch = client.get(f"/api/assessments/{assessment_id}")
    assert res_fetch.status_code == 200
    stored_assessment = res_fetch.json()
    assert stored_assessment["id"] == assessment_id
    assert stored_assessment["student_id"] == student_id
    assert len(stored_assessment["results"]) == 1

    stored_result = stored_assessment["results"][0]
    assert Decimal(str(stored_result["total_study_cost"])) == Decimal("5950000.00")
    assert Decimal(str(stored_result["funding_gap"])) == Decimal("4325000.00")
    assert len(stored_result["rule_results"]) > 0
