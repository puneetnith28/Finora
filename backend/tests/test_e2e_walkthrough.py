"""End-to-end full user journey validation script for Finora."""

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


def test_full_user_journey_walkthrough(client: TestClient):
    """Walkthrough: Health -> Demo Seed -> Assessment Wizard -> Simulation -> Comparison -> Report Retrieval."""
    # 1. Health check readiness
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

    # 2. Seed demo scenarios for quick evaluation
    seed_res = client.post("/api/demo/seed")
    assert seed_res.status_code == 201
    scenarios = seed_res.json()["scenarios"]
    assert len(scenarios) == 5

    # 3. Simulate FOIR interactively
    foir_sim = client.post(
        "/api/simulator/foir",
        json={
            "loan_amount_inr": "4000000.00",
            "annual_interest_rate_percent": "10.50",
            "tenure_months": 120,
            "monthly_net_income_inr": "120000.00",
            "existing_monthly_obligations_inr": "15000.00",
        },
    )
    assert foir_sim.status_code == 200
    assert foir_sim.json()["status_badge"] in ["Safe", "Stretched"]

    # 4. Simulate Lender Impact
    lender_sim = client.post(
        "/api/simulator/lender-impact",
        json={
            "target_country": "USA",
            "co_borrower_monthly_income_inr": "150000.00",
            "existing_monthly_obligations_inr": "10000.00",
            "simulated_loan_amount_inr": "5000000.00",
            "simulated_interest_rate_percent": "10.00",
            "simulated_tenure_months": 120,
            "cibil_score": 780,
            "has_collateral": True,
        },
    )
    assert lender_sim.status_code == 200
    assert len(lender_sim.json()["lender_impacts"]) > 0

    # 5. Create Fresh Student Candidate
    st = client.post(
        "/api/students",
        json={
            "name": "Karthik Subramanian",
            "email": "karthik.s@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "Columbia University",
            "target_course": "MS in Financial Engineering",
        },
    )
    assert st.status_code == 201
    sid = st.json()["id"]

    # Step 2: Study plan
    sp = client.post(
        f"/api/students/{sid}/study-plan",
        json={
            "tuition_fee": "60000.00",
            "living_expenses": "22000.00",
            "currency": "USD",
            "duration_months": 24,
            "exchange_rate_to_inr": "85.00",
        },
    )
    assert sp.status_code == 201

    # Step 3: Funding
    client.post(
        f"/api/students/{sid}/funding",
        json={
            "source_type": "savings",
            "amount_original": "2000000.00",
            "currency": "INR",
            "verified": True,
        },
    )

    # Step 4: Financial Profile
    client.post(
        f"/api/students/{sid}/financial-profile",
        json={
            "monthly_income": "220000.00",
            "existing_monthly_obligations": "20000.00",
        },
    )

    # Step 5: Collateral
    client.post(
        f"/api/students/{sid}/collaterals",
        json={
            "collateral_type": "property",
            "market_value_inr": "9000000.00",
        },
    )

    # Step 6: Evaluate Assessment
    eval_res = client.post(f"/api/students/{sid}/assessments", json={})
    assert eval_res.status_code == 201
    aid = eval_res.json()["assessment_id"]

    # 6. Fetch complete report by ID
    rep_res = client.get(f"/api/assessments/{aid}")
    assert rep_res.status_code == 200
    assert rep_res.json()["id"] == aid
    assert len(rep_res.json()["results"]) > 0
