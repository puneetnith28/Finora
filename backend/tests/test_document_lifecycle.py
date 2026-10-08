import io

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


def create_dummy_pdf_content() -> bytes:
    """Generate minimal valid PDF binary payload with standard magic bytes."""
    return b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< >>\n%%EOF"


def create_dummy_png_content() -> bytes:
    """Generate minimal valid PNG binary payload with magic bytes."""
    return b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"


def create_dummy_jpg_content() -> bytes:
    """Generate minimal valid JPEG binary payload with magic bytes."""
    return b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00"


def test_document_upload_success_and_metadata(client: TestClient) -> None:
    """Test uploading a valid PDF document and persisting isolated metadata."""
    student_res = client.post(
        "/api/students",
        json={
            "name": "Arjun Nair",
            "email": "arjun.nair.docs@example.com",
            "target_country": "USA",
            "target_university": "Columbia University",
            "target_course": "MS Financial Engineering",
        },
    )
    assert student_res.status_code == 201
    student_id = student_res.json()["id"]

    pdf_bytes = create_dummy_pdf_content()
    files = {
        "file": ("admission_offer.pdf", io.BytesIO(pdf_bytes), "application/pdf")
    }
    data = {
        "document_type": "admission_letter",
    }

    upload_res = client.post(
        f"/api/students/{student_id}/documents",
        files=files,
        data=data,
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    assert doc_data["file_name"] == "admission_offer.pdf"
    assert doc_data["document_type"] == "admission_letter"
    assert doc_data["mime_type"] == "application/pdf"
    assert doc_data["file_size"] == len(pdf_bytes)
    assert doc_data["status"] == "uploaded"
    assert "student_id" in doc_data
    assert doc_data["student_id"] == student_id

    doc_id = doc_data["id"]

    # 2. Retrieve Document Metadata
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id

    # 3. Stream / Preview Document File Safely
    preview_res = client.get(f"/api/documents/{doc_id}/preview")
    assert preview_res.status_code == 200
    assert preview_res.content == pdf_bytes
    assert "inline" in preview_res.headers.get("content-disposition", "")

    # 4. Download File with attachment disposition
    download_res = client.get(f"/api/documents/{doc_id}/preview?download=true")
    assert download_res.status_code == 200
    assert "attachment" in download_res.headers.get("content-disposition", "")

    # 5. List Student Documents
    list_res = client.get(f"/api/students/{student_id}/documents")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 6. Delete Document
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 204

    # Confirm 404 after deletion
    get_after_del = client.get(f"/api/documents/{doc_id}")
    assert get_after_del.status_code == 404


def test_document_validation_errors(client: TestClient) -> None:
    """Test validation errors for empty, invalid extension, and fake signatures."""
    student_res = client.post(
        "/api/students",
        json={
            "name": "Doc Validation Student",
            "email": "doc.val@example.com",
            "target_country": "UK",
            "target_university": "Oxford University",
            "target_course": "MSc Computer Science",
        },
    )
    assert student_res.status_code == 201
    student_id = student_res.json()["id"]

    # 1. Empty file
    files_empty = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    res_empty = client.post(
        f"/api/students/{student_id}/documents",
        files=files_empty,
        data={"document_type": "passport"},
    )
    assert res_empty.status_code == 400
    msg_empty = res_empty.json().get("error", {}).get("message") or res_empty.json().get("detail", "")
    assert "empty" in msg_empty.lower()

    # 2. Invalid Extension (.exe)
    files_exe = {"file": ("malware.exe", io.BytesIO(b"MZ12345"), "application/x-msdownload")}
    res_exe = client.post(
        f"/api/students/{student_id}/documents",
        files=files_exe,
        data={"document_type": "other"},
    )
    assert res_exe.status_code == 400
    msg_exe = res_exe.json().get("error", {}).get("message") or res_exe.json().get("detail", "")
    assert "not supported" in msg_exe.lower()

    # 3. Fake PDF Header / Corrupted Signature
    files_fake = {"file": ("corrupted.pdf", io.BytesIO(b"NOT_A_REAL_PDF_HEADER"), "application/pdf")}
    res_fake = client.post(
        f"/api/students/{student_id}/documents",
        files=files_fake,
        data={"document_type": "itr"},
    )
    assert res_fake.status_code == 400
    msg_fake = res_fake.json().get("error", {}).get("message") or res_fake.json().get("detail", "")
    assert "signature" in msg_fake.lower()


def test_document_readiness_rules_evaluation(client: TestClient) -> None:
    """Test contextual readiness checklist based on funding and collateral profile."""
    # Create student
    student_res = client.post(
        "/api/students",
        json={
            "name": "Rohan Deshmukh",
            "email": "rohan.deshmukh@example.com",
            "target_country": "Germany",
            "target_university": "RWTH Aachen",
            "target_course": "MSc Mechanical Engineering",
        },
    )
    assert student_res.status_code == 201
    student_id = student_res.json()["id"]

    # Add scholarship funding source
    client.post(
        f"/api/students/{student_id}/funding-sources",
        json={
            "source_type": "scholarship",
            "amount_original": 10000,
            "currency": "EUR",
            "exchange_rate_to_inr": 92.0,
        },
    )

    # Add collateral
    client.post(
        f"/api/students/{student_id}/collaterals",
        json={
            "collateral_type": "residential_property",
            "ownership_status": "co_owned_parents",
            "market_value_inr": 8000000,
        },
    )

    # Check initial readiness report (should flag missing mandatory documents)
    readiness_res = client.get(f"/api/students/{student_id}/documents/readiness")
    assert readiness_res.status_code == 200
    report = readiness_res.json()
    assert report["total_missing"] >= 4
    assert report["overall_readiness"] in ["partially_ready", "action_required"]

    # Upload Admission Letter
    pdf_bytes = create_dummy_pdf_content()
    client.post(
        f"/api/students/{student_id}/documents",
        files={"file": ("rwth_admission.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"document_type": "admission_letter"},
    )

    # Upload Passport
    client.post(
        f"/api/students/{student_id}/documents",
        files={"file": ("passport.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"document_type": "passport"},
    )

    # Re-check readiness
    readiness_res_after = client.get(f"/api/students/{student_id}/documents/readiness")
    assert readiness_res_after.status_code == 200
    report_after = readiness_res_after.json()
    assert report_after["total_uploaded"] >= 2
