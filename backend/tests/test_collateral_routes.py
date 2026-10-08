"""Unit and API tests for Collateral endpoints."""

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


def test_collateral_routes_lifecycle(client: TestClient) -> None:
    # 1. Create student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Manish Sharma",
            "email": "manish.sharma@example.com",
            "country_of_origin": "India",
            "target_country": "UK",
            "target_university": "Imperial College London",
            "target_course": "MSc Computing",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add Collateral (Property: 50,00,000 INR market value, 10,00,000 encumbrance)
    collateral_payload = {
        "collateral_type": "property",
        "ownership_status": "sole",
        "description": "Apartment in Bengaluru",
        "market_value_inr": "5000000.00",
        "existing_encumbrance_inr": "1000000.00",
    }
    res_add = client.post(f"/api/students/{student_id}/collateral", json=collateral_payload)
    assert res_add.status_code == 201
    c_data = res_add.json()
    assert c_data["id"] is not None
    # (50L - 10L encumbrance) * 0.80 haircut = 32L eligible
    assert Decimal(str(c_data["eligible_value_inr"])) == Decimal("3200000.00")
    collateral_id = c_data["id"]

    # 3. List collaterals
    res_list = client.get(f"/api/students/{student_id}/collaterals")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 4. Get single collateral
    res_get = client.get(f"/api/collateral/{collateral_id}")
    assert res_get.status_code == 200
    assert res_get.json()["description"] == "Apartment in Bengaluru"

    # 5. Patch collateral (clear encumbrance to 0 -> eligible = 40L)
    res_patch = client.patch(
        f"/api/collateral/{collateral_id}", json={"existing_encumbrance_inr": "0.00"}
    )
    assert res_patch.status_code == 200
    assert Decimal(str(res_patch.json()["eligible_value_inr"])) == Decimal("4000000.00")

    # 6. Delete collateral
    res_del = client.delete(f"/api/collateral/{collateral_id}")
    assert res_del.status_code == 204

    res_list_after = client.get(f"/api/students/{student_id}/collaterals")
    assert len(res_list_after.json()) == 0
