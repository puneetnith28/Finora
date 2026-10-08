"""Unit and API tests for Financial Profile, Asset, and Liability endpoints."""

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


def test_financial_profile_and_sub_resources_lifecycle(client: TestClient) -> None:
    # 1. Create student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Devansh Roy",
            "email": "devansh.roy@example.com",
            "country_of_origin": "India",
            "target_country": "Canada",
            "target_university": "University of Toronto",
            "target_course": "MEng Electrical",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add Asset
    asset_payload = {
        "asset_type": "fixed_deposit",
        "description": "HDFC FD",
        "estimated_value_inr": "500000.00",
        "is_liquid": True,
    }
    res_asset = client.post(f"/api/students/{student_id}/assets", json=asset_payload)
    assert res_asset.status_code == 201
    asset_id = res_asset.json()["id"]

    # 3. Add Liability
    liab_payload = {
        "liability_type": "personal_loan",
        "lender_name": "ICICI Bank",
        "outstanding_amount_inr": "100000.00",
        "monthly_emi_inr": "5000.00",
    }
    res_liab = client.post(f"/api/students/{student_id}/liabilities", json=liab_payload)
    assert res_liab.status_code == 201
    liab_id = res_liab.json()["id"]

    # 4. Create Financial Profile (Monthly income: 100,000 INR, 20L loan request)
    profile_payload = {
        "monthly_income": "100000.00",
        "existing_monthly_obligations": "5000.00",
        "monthly_living_expenses": "20000.00",
        "requested_loan_amount": "2000000.00",
        "loan_tenure_months": 120,
        "loan_interest_rate": "10.50",
    }
    res_prof = client.post(
        f"/api/students/{student_id}/financial-profile", json=profile_payload
    )
    assert res_prof.status_code == 201
    prof_data = res_prof.json()

    # Verify calculated fields: EMI > 0, FOIR > 0, Total Assets = 5L, Total Liab = 1L, Net Worth = 4L
    assert Decimal(str(prof_data["proposed_emi"])) > Decimal("0.00")
    assert Decimal(str(prof_data["foir"])) > Decimal("0.00")
    assert Decimal(str(prof_data["total_assets_inr"])) == Decimal("500000.00")
    assert Decimal(str(prof_data["total_liabilities_inr"])) == Decimal("100000.00")
    assert Decimal(str(prof_data["net_worth_inr"])) == Decimal("400000.00")

    # 5. Get Financial Profile
    res_get_prof = client.get(f"/api/students/{student_id}/financial-profile")
    assert res_get_prof.status_code == 200
    assert Decimal(str(res_get_prof.json()["monthly_income"])) == Decimal("100000.00")

    # 6. Patch Asset and verify profile net worth recomputes
    res_patch_asset = client.patch(
        f"/api/assets/{asset_id}", json={"estimated_value_inr": "800000.00"}
    )
    assert res_patch_asset.status_code == 200

    res_get_prof2 = client.get(f"/api/students/{student_id}/financial-profile")
    assert Decimal(str(res_get_prof2.json()["total_assets_inr"])) == Decimal("800000.00")
    assert Decimal(str(res_get_prof2.json()["net_worth_inr"])) == Decimal("700000.00")

    # 7. Delete liability
    res_del_liab = client.delete(f"/api/liabilities/{liab_id}")
    assert res_del_liab.status_code == 204

    res_get_prof3 = client.get(f"/api/students/{student_id}/financial-profile")
    assert Decimal(str(res_get_prof3.json()["total_liabilities_inr"])) == Decimal("0.00")
    assert Decimal(str(res_get_prof3.json()["net_worth_inr"])) == Decimal("800000.00")
