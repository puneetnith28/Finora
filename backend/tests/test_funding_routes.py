"""Unit and API tests for Funding endpoints."""

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


def test_funding_routes_lifecycle(client: TestClient) -> None:
    # 1. Create student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Kavya Nair",
            "email": "kavya.nair@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "NYU",
            "target_course": "MS Financial Engineering",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add family savings funding (10,000 USD @ 85.00)
    fund_payload = {
        "source_type": "savings",
        "amount_original": "10000.00",
        "currency": "USD",
        "exchange_rate_to_inr": "85.00",
        "verified": True,
    }
    res_add = client.post(f"/api/students/{student_id}/funding", json=fund_payload)
    assert res_add.status_code == 201
    fund_data = res_add.json()
    assert fund_data["id"] is not None
    assert Decimal(str(fund_data["amount_inr"])) == Decimal("850000.00")
    funding_id = fund_data["id"]

    # 3. Add second funding (INR scholarship 2,00,000)
    fund_payload2 = {
        "source_type": "scholarship",
        "amount_original": "200000.00",
        "currency": "INR",
        "verified": False,
    }
    res_add2 = client.post(f"/api/students/{student_id}/funding", json=fund_payload2)
    assert res_add2.status_code == 201
    assert Decimal(str(res_add2.json()["amount_inr"])) == Decimal("200000.00")

    # 4. List funding sources
    res_list = client.get(f"/api/students/{student_id}/funding")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 2

    # 5. Get single funding item
    res_get = client.get(f"/api/funding/{funding_id}")
    assert res_get.status_code == 200
    assert res_get.json()["source_type"] == "savings"

    # 6. Patch funding item
    patch_payload = {"amount_original": "12000.00"}
    res_patch = client.patch(f"/api/funding/{funding_id}", json=patch_payload)
    assert res_patch.status_code == 200
    # 12,000 * 85 = 1,020,000
    assert Decimal(str(res_patch.json()["amount_inr"])) == Decimal("1020000.00")

    # 7. Delete funding item
    res_del = client.delete(f"/api/funding/{funding_id}")
    assert res_del.status_code == 204

    # 8. Verify only 1 funding item remains
    res_list_after = client.get(f"/api/students/{student_id}/funding")
    assert len(res_list_after.json()) == 1
