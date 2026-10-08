"""Tests for Phase 8 OCR, text extraction, domain parsers, and discrepancy engine."""

import io
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.main import app
from app.models.document import Document, DocumentStatus
from app.models.financial_profile import FinancialProfile
from app.services.assessment_orchestrator import run_candidate_assessment
from app.services.ocr.discrepancy_engine import (
    DiscrepancySeverity,
    evaluate_income_discrepancy,
)
from app.services.ocr.domain_extractors import (
    BankStatementExtractor,
    ITRExtractor,
    SalarySlipExtractor,
)
from app.services.ocr.parsers import OcrFallbackEngine


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_salary_slip_domain_extractor():
    """Test salary slip extractor correctly parses gross, net, deductions and metadata."""
    sample_text = """
    ACME Corporation Pvt Ltd
    Pay Slip for the month of September 2026
    Employee Name: Rahul Sharma
    Designation: Senior Software Engineer
    Gross Salary: Rs. 1,50,000.00
    Total Deductions: 15,000.00
    Net Pay: 1,35,000.00
    Date of Payment: 30/09/2026
    """
    extractor = SalarySlipExtractor()
    payload = extractor.extract(sample_text)

    assert "gross_income_monthly" in payload.fields
    assert payload.fields["gross_income_monthly"].value == Decimal("150000.00")
    assert payload.fields["net_income_monthly"].value == Decimal("135000.00")
    assert payload.fields["total_deductions_monthly"].value == Decimal("15000.00")
    assert payload.fields["employer_name"].value == "ACME Corporation Pvt Ltd"
    assert payload.fields["employee_name"].value == "Rahul Sharma"
    assert payload.fields["pay_date"].value == "30/09/2026"
    assert payload.confidence_score >= 0.8


def test_itr_domain_extractor():
    """Test ITR-V extractor parses gross total income and derives monthly equivalent."""
    sample_text = """
    INDIAN INCOME TAX RETURN VERIFICATION FORM - ITR-V
    Assessment Year: 2026-27
    PAN: ABCDE1234F
    Name: Rahul Sharma
    Gross Total Income: 18,00,000
    Total Tax Payable: 2,40,000
    """
    extractor = ITRExtractor()
    payload = extractor.extract(sample_text)

    assert "gross_total_income" in payload.fields
    assert payload.fields["gross_total_income"].value == Decimal("1800000.00")
    assert payload.fields["derived_monthly_income"].value == Decimal("150000.00")
    assert payload.fields["pan_number"].value == "ABCDE1234F"
    assert payload.fields["assessment_year"].value == "2026-27"


def test_bank_statement_domain_extractor():
    """Test bank statement extractor parses summary figures and metrics."""
    sample_text = """
    HDFC Bank Statement
    Account Number: 50100234567890
    Statement Period: 01/08/2026 to 31/08/2026
    Total Credits: INR 1,60,000.00
    Total Debits: INR 45,000.00
    Average Monthly Balance: INR 85,000.00
    Total Transactions: 42
    """
    extractor = BankStatementExtractor()
    payload = extractor.extract(sample_text)

    assert payload.fields["account_number"].value == "50100234567890"
    assert payload.fields["total_credits"].value == Decimal("160000.00")
    assert payload.fields["total_debits"].value == Decimal("45000.00")
    assert payload.fields["average_balance"].value == Decimal("85000.00")
    assert payload.fields["transaction_count"].value == 42


def test_replaceable_ocr_fallback():
    """Verify fallback OCR engine returns graceful structured results on raw images."""
    ocr_engine = OcrFallbackEngine()
    text, conf = ocr_engine.process_image_or_scanned_pdf(b"fake_image_content")
    assert isinstance(text, str)
    assert conf >= 0.8
    assert ocr_engine.engine_name == "tesseract_compatible"


def test_discrepancy_evaluation_within_tolerance(client: TestClient, db_session):
    """Test discrepancy engine passes income when variance is within tolerance."""
    # 1. Create student
    st_res = client.post(
        "/api/students",
        json={
            "name": "Kiran Rao",
            "email": "kiran.rao@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "Stanford University",
            "target_course": "MS CS",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    # 2. Add financial profile with ₹1,50,000 monthly income
    fin = FinancialProfile(
        student_id=student_id,
        monthly_income=Decimal("150000.00"),
    )
    db_session.add(fin)
    db_session.commit()

    # 3. Upload dummy salary slip with ₹1,48,000 gross
    pdf_content = (
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n"
        b"Gross Salary: Rs. 1,48,000.00\nNet Pay: Rs. 1,35,000.00\n%%EOF"
    )
    upload_res = client.post(
        f"/api/students/{student_id}/documents",
        files={"file": ("salary_slip.pdf", io.BytesIO(pdf_content), "application/pdf")},
        data={"document_type": "salary_slip"},
    )
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    # 4. Evaluate discrepancy
    report = evaluate_income_discrepancy(
        db=db_session,
        student_id=student_id,
        document_id=doc_id,
        tolerance_percent=10.0,
    )

    # 150000 vs 148000 -> ~1.35% variance -> Minor / Verified
    assert report.severity in (DiscrepancySeverity.MINOR, DiscrepancySeverity.NONE)
    assert not report.needs_human_review

    # Check updated document status in DB
    doc = db_session.get(Document, doc_id)
    assert doc.status == DocumentStatus.VERIFIED


def test_discrepancy_evaluation_exceeding_tolerance_flags_review(client: TestClient, db_session):
    """Test discrepancy engine flags review when variance exceeds tolerance (>10%)."""
    st_res = client.post(
        "/api/students",
        json={
            "name": "Deepak Verma",
            "email": "deepak.verma@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "MIT",
            "target_course": "MBA",
        },
    )
    assert st_res.status_code == 201
    student_id = st_res.json()["id"]

    fin = FinancialProfile(
        student_id=student_id,
        monthly_income=Decimal("200000.00"),
    )
    db_session.add(fin)
    db_session.commit()


    # Upload salary slip with only ₹80,000 gross income
    pdf_content = (
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n"
        b"Gross Salary: Rs. 80,000.00\nNet Pay: Rs. 70,000.00\n%%EOF"
    )
    upload_res = client.post(
        f"/api/students/{student_id}/documents",
        files={"file": ("salary_slip_low.pdf", io.BytesIO(pdf_content), "application/pdf")},
        data={"document_type": "salary_slip"},
    )
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    report = evaluate_income_discrepancy(
        db=db_session,
        student_id=student_id,
        document_id=doc_id,
        tolerance_percent=10.0,
    )

    # 200,000 vs 80,000 -> 150% variance -> Major discrepancy / Needs Review
    assert report.severity == DiscrepancySeverity.MAJOR
    assert report.needs_human_review
    assert "Applicant entered" in report.review_note

    doc = db_session.get(Document, doc_id)
    assert doc.status == DocumentStatus.NEEDS_REVIEW


def test_discrepancy_api_endpoint(client: TestClient):
    """Test GET /api/students/{student_id}/discrepancies API endpoint."""
    st_res = client.post(
        "/api/students",
        json={
            "name": "Pooja Hegde",
            "email": "pooja.hegde@example.com",
            "country_of_origin": "India",
            "target_country": "Canada",
            "target_university": "University of Toronto",
            "target_course": "MSc Data Science",
        },
    )
    student_id = st_res.json()["id"]

    res = client.get(f"/api/students/{student_id}/discrepancies")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_assessment_orchestration_includes_ocr_evidence(client: TestClient, db_session):
    """Test full assessment report captures extracted evidence and discrepancy flags."""
    st_res = client.post(
        "/api/students",
        json={
            "name": "Ananya Roy",
            "email": "ananya.roy@example.com",
            "country_of_origin": "India",
            "target_country": "USA",
            "target_university": "NYU",
            "target_course": "MS EE",
        },
    )
    student_id = st_res.json()["id"]


    report = run_candidate_assessment(
        student_id=student_id,
        db=db_session,
        requested_loan_amount_inr=Decimal("2500000"),
    )

    assert hasattr(report, "document_evidence")
    assert hasattr(report, "discrepancy_flags")
    assert isinstance(report.document_evidence, list)
    assert isinstance(report.discrepancy_flags, list)
