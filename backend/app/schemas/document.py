"""Pydantic schemas for Document."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.document import DocumentStatus, DocumentType, ExtractionStatus


class DocumentBase(BaseModel):
    document_type: DocumentType = Field(
        default=DocumentType.OTHER, description="Type or category of the document"
    )
    file_name: str = Field(..., max_length=255, description="Original filename")
    file_path: str = Field(..., max_length=500, description="Relative storage path")
    mime_type: str = Field(default="application/pdf", max_length=100, description="MIME type")
    file_size: int = Field(default=0, ge=0, description="File size in bytes")
    status: DocumentStatus = Field(
        default=DocumentStatus.UPLOADED, description="Verification status"
    )
    extraction_status: ExtractionStatus = Field(
        default=ExtractionStatus.PENDING, description="OCR and data extraction status"
    )
    extracted_data_json: str | None = Field(
        default=None, description="Extracted key-value pairs or structured payload as JSON"
    )


class DocumentCreate(DocumentBase):
    student_id: int
    assessment_id: int | None = None


class DocumentUpdate(BaseModel):
    document_type: DocumentType | None = None
    status: DocumentStatus | None = None
    verified_at: datetime | None = None
    extraction_status: ExtractionStatus | None = None
    extracted_data_json: str | None = None


class DocumentResponse(DocumentBase):
    id: int
    student_id: int
    assessment_id: int | None
    uploaded_at: datetime
    verified_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


DocumentRead = DocumentResponse
