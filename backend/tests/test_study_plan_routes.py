"""Unit and API tests for Study Plan endpoints."""

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


def test_study_plan_routes_lifecycle(client: TestClient) -> None:
    # 1. Create student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Ananya Sen",
            "email": "ananya.sen@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "Columbia University",
            "target_course": "MS in Data Science",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Get study plan before creation -> 404
    res_get_empty = client.get(f"/api/students/{student_id}/study-plan")
    assert res_get_empty.status_code == 404

    # 3. Create study plan ($45,000 tuition, $15,000 living, exchange rate 85.00)
    sp_payload = {
        "tuition_fee": "45000.00",
        "living_expenses": "15000.00",
        "travel_expenses": "2000.00",
        "other_expenses": "1000.00",
        "currency": "USD",
        "duration_months": 24,
        "exchange_rate_to_inr": "85.00",
    }
    res_create = client.post(f"/api/students/{student_id}/study-plan", json=sp_payload)
    assert res_create.status_code == 201
    data = res_create.json()
    assert Decimal(str(data["total_cost_original"])) == Decimal("63000.00")
    assert Decimal(str(data["total_cost_inr"])) == Decimal("5355000.00")

    # 4. Get study plan
    res_get = client.get(f"/api/students/{student_id}/study-plan")
    assert res_get.status_code == 200
    assert Decimal(str(res_get.json()["tuition_fee"])) == Decimal("45000.00")

    # 5. Patch study plan
    patch_payload = {"tuition_fee": "50000.00"}
    res_patch = client.patch(f"/api/students/{student_id}/study-plan", json=patch_payload)
    assert res_patch.status_code == 200
    # 50k + 15k + 2k + 1k = 68k * 85 = 5,780,000
    assert Decimal(str(res_patch.json()["total_cost_original"])) == Decimal("68000.00")
    assert Decimal(str(res_patch.json()["total_cost_inr"])) == Decimal("5780000.00")
