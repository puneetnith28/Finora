"""Unit tests for Document model and schemas."""

import pytest
from pydantic import ValidationError

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.document import Document, DocumentStatus, DocumentType, ExtractionStatus
from app.models.student import Student
from app.schemas.document import DocumentCreate, DocumentUpdate


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_document_model() -> None:
    db = SessionLocal()
    try:
        student = Student(
            name="Vikram Patel",
            email="vikram.doc@example.com",
            country_of_origin="India",
            target_country="UK",
            target_university="Imperial College London",
            target_course="MSc Advanced Computing",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        doc = Document(
            student_id=student.id,
            document_type=DocumentType.ADMISSION_LETTER,
            file_name="imperial_offer_letter.pdf",
            file_path="uploads/students/1/imperial_offer_letter.pdf",
            mime_type="application/pdf",
            file_size=204850,
            status=DocumentStatus.VERIFIED,
            extraction_status=ExtractionStatus.EXTRACTED,
            extracted_data_json='{"course": "MSc Advanced Computing", "tuition_fee": 38500}',
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        assert doc.id is not None
        assert doc.student_id == student.id
        assert doc.document_type == DocumentType.ADMISSION_LETTER
        assert doc.status == DocumentStatus.VERIFIED
        assert doc.extraction_status == ExtractionStatus.EXTRACTED
        assert doc.file_size == 204850
        assert doc.student.name == "Vikram Patel"
        assert len(student.documents) == 1
    finally:
        db.close()


def test_document_cascade_delete() -> None:
    db = SessionLocal()
    try:
        student = Student(
            name="Priya Document",
            email="priya.doc@example.com",
            country_of_origin="India",
            target_country="Canada",
            target_university="University of Toronto",
            target_course="Master of Science in Applied Computing",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        doc = Document(
            student_id=student.id,
            document_type=DocumentType.PASSPORT,
            file_name="passport_scan.pdf",
            file_path="uploads/students/2/passport_scan.pdf",
            mime_type="application/pdf",
            file_size=102400,
            status=DocumentStatus.UPLOADED,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        doc_id = doc.id

        db.delete(student)
        db.commit()

        deleted = db.query(Document).filter_by(id=doc_id).first()
        assert deleted is None
    finally:
        db.close()


def test_document_schemas() -> None:
    create_schema = DocumentCreate(
        student_id=1,
        document_type=DocumentType.BANK_STATEMENT,
        file_name="hdfc_6month_statement.pdf",
        file_path="uploads/students/1/hdfc_6month_statement.pdf",
        mime_type="application/pdf",
        file_size=524288,
        status=DocumentStatus.UPLOADED,
        extraction_status=ExtractionStatus.PENDING,
    )
    assert create_schema.document_type == DocumentType.BANK_STATEMENT
    assert create_schema.file_size == 524288

    update_schema = DocumentUpdate(
        status=DocumentStatus.VERIFIED,
        extraction_status=ExtractionStatus.EXTRACTED,
        extracted_data_json='{"average_balance": 540000}',
    )
    assert update_schema.status == DocumentStatus.VERIFIED
    assert update_schema.extraction_status == ExtractionStatus.EXTRACTED

    with pytest.raises(ValidationError):
        DocumentCreate(
            student_id=1,
            file_name="test.pdf",
            file_path="test/path",
            file_size=-50,
        )
