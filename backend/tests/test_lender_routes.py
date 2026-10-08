"""Unit and API tests for Lender endpoints."""

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


def test_lender_routes_lifecycle(client: TestClient) -> None:
    # 1. Listing lenders auto-seeds demo data if empty
    res_list = client.get("/api/lenders")
    assert res_list.status_code == 200
    lenders = res_list.json()
    assert len(lenders) >= 4

    lender_id = lenders[0]["id"]

    # 2. Get single lender
    res_get = client.get(f"/api/lenders/{lender_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == lender_id
    assert len(res_get.json()["criteria"]) > 0

    # 3. Create custom lender
    create_payload = {
        "name": "Finora Custom Bank",
        "description": "Demo lender criteria — For assessment demonstration only",
        "active": True,
        "criteria": [
            {
                "criterion_type": "min_cibil",
                "operator": "gte",
                "threshold_value": "700.00",
                "required": True,
            }
        ],
    }
    res_create = client.post("/api/lenders", json=create_payload)
    assert res_create.status_code == 201
    assert res_create.json()["name"] == "Finora Custom Bank"
    new_id = res_create.json()["id"]

    # 4. Patch lender active state
    res_patch = client.patch(f"/api/lenders/{new_id}", json={"active": False})
    assert res_patch.status_code == 200
    assert res_patch.json()["active"] is False
