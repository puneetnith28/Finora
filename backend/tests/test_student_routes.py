"""Unit and API tests for Student endpoints."""

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


def test_student_crud_lifecycle(client: TestClient) -> None:
    # 1. Create student
    create_payload = {
        "name": "Rohan Gupta",
        "email": "rohan.gupta@example.com",
        "country_of_origin": "India",
        "target_country": "USA",
        "target_university": "Stanford University",
        "target_course": "MS in AI",
    }
    res = client.post("/api/students", json=create_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] is not None
    assert data["name"] == "Rohan Gupta"
    student_id = data["id"]

    # 2. Duplicate email returns 409
    res_dup = client.post("/api/students", json=create_payload)
    assert res_dup.status_code == 409

    # 3. Get student by id
    res_get = client.get(f"/api/students/{student_id}")
    assert res_get.status_code == 200
    assert res_get.json()["email"] == "rohan.gupta@example.com"

    # 4. List students
    res_list = client.get("/api/students")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 5. Patch student
    patch_payload = {"target_university": "MIT"}
    res_patch = client.patch(f"/api/students/{student_id}", json=patch_payload)
    assert res_patch.status_code == 200
    assert res_patch.json()["target_university"] == "MIT"

    # 6. Delete student
    res_delete = client.delete(f"/api/students/{student_id}")
    assert res_delete.status_code == 204

    # 7. Non-existent student returns 404
    res_get_404 = client.get(f"/api/students/{student_id}")
    assert res_get_404.status_code == 404
