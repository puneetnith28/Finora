"""Unit and API tests for the FOIR Simulator."""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.simulator import FoirSimulatorRequest
from app.services.simulator_service import run_foir_simulation


@pytest.fixture
def client():
    return TestClient(app)


def test_foir_simulation_service_safe():
    """Test FOIR calculation with low debt ratio yields Safe status badge."""
    req = FoirSimulatorRequest(
        loan_amount_inr=Decimal("2000000.00"),
        annual_interest_rate_percent=Decimal("10.00"),
        tenure_months=120,
        monthly_net_income_inr=Decimal("150000.00"),
        existing_monthly_obligations_inr=Decimal("10000.00"),
    )
    res = run_foir_simulation(req)
    # EMI for 20L at 10% for 120m is ~26,430 INR
    assert res.simulated_emi_inr > Decimal("25000")
    # Total obligations ~36,430 on 1,50,000 income -> ~24.3% FOIR -> Safe
    assert res.status_badge == "Safe"
    assert res.foir_percentage < 30.0
    assert res.max_affordable_emi_inr == Decimal("65000.00")  # (1.5L * 0.5) - 10k


def test_foir_simulation_service_high_risk():
    """Test FOIR calculation with high debt ratio yields High Risk status badge."""
    req = FoirSimulatorRequest(
        loan_amount_inr=Decimal("5000000.00"),
        annual_interest_rate_percent=Decimal("12.00"),
        tenure_months=60,
        monthly_net_income_inr=Decimal("80000.00"),
        existing_monthly_obligations_inr=Decimal("30000.00"),
    )
    res = run_foir_simulation(req)
    # EMI for 50L at 12% for 60m is ~1,11,222 INR + 30k = 1,41,222 on 80k income -> >100% FOIR
    assert res.status_badge == "High Risk"
    assert res.foir_percentage > 60.0
    assert len(res.remedial_suggestions) > 0


def test_foir_simulator_api_endpoint(client: TestClient):
    """Test POST /api/simulator/foir endpoint."""
    payload = {
        "loan_amount_inr": "3000000.00",
        "annual_interest_rate_percent": "10.50",
        "tenure_months": 120,
        "monthly_net_income_inr": "100000.00",
        "existing_monthly_obligations_inr": "15000.00",
    }
    response = client.post("/api/simulator/foir", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_emi_inr" in data
    assert "foir_percentage" in data
    assert "status_badge" in data
    assert "remedial_suggestions" in data
