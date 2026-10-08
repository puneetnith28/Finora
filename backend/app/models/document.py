"""Document domain model."""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.student import Student


class DocumentType(enum.StrEnum):
    PASSPORT = "passport"
    ADMISSION_LETTER = "admission_letter"
    FEE_STRUCTURE = "fee_structure"
    SALARY_SLIP = "salary_slip"
    BANK_STATEMENT = "bank_statement"
    ITR = "itr"
    PROPERTY_DOCUMENT = "property_document"
    COLLATERAL_DEED = "collateral_deed"
    SCHOLARSHIP_PROOF = "scholarship_proof"
    ACADEMIC_TRANSCRIPT = "academic_transcript"
    OTHER = "other"


class DocumentStatus(enum.StrEnum):
    MISSING = "missing"
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    VERIFIED = "verified"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"


class ExtractionStatus(enum.StrEnum):
    PENDING = "pending"
    EXTRACTED = "extracted"
    FAILED = "failed"
    NOT_APPLICABLE = "not_applicable"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assessment_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, native_enum=False, length=50), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False, default="application/pdf")
    file_size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus, native_enum=False, length=50),
        nullable=False,
        default=DocumentStatus.UPLOADED,
    )
    extraction_status: Mapped[ExtractionStatus] = mapped_column(
        Enum(ExtractionStatus, native_enum=False, length=50),
        nullable=False,
        default=ExtractionStatus.PENDING,
    )
    extracted_data_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="documents")

    def __repr__(self) -> str:
        return (
            f"<Document(id={self.id}, student_id={self.student_id}, "
            f"type='{self.document_type.value}', status='{self.status.value}')>"
        )
