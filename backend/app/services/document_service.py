import os
import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document, DocumentStatus, DocumentType, ExtractionStatus
from app.models.student import Student

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/octet-stream",  # often sent by clients for raw binary
}

# Magic byte signatures
MAGIC_SIGNATURES = {
    b"%PDF-": "application/pdf",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
}


def sanitize_filename(filename: str) -> str:
    """Sanitize original filename to remove path traversal and special characters."""
    clean = os.path.basename(filename)
    clean = re.sub(r"[^\w\.-]", "_", clean)
    return clean[:100] if clean else "document.pdf"


def detect_mime_from_bytes(content: bytes) -> str | None:
    """Detect true MIME type using magic header bytes."""
    for signature, mime in MAGIC_SIGNATURES.items():
        if content.startswith(signature):
            return mime
    return None


def validate_upload_file(file: UploadFile, content: bytes) -> tuple[str, str]:
    """Validate file extension, size, non-emptiness, and magic bytes.

    Returns (sanitized_original_filename, detected_mime_type).
    """
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(content) > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {max_mb:.1f}MB.",
        )

    original_name = sanitize_filename(file.filename or "upload.pdf")
    ext = Path(original_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is not supported. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    detected_mime = detect_mime_from_bytes(content)
    if not detected_mime:
        # If magic bytes don't match standard PDF/JPG/PNG signatures
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match a valid PDF or Image header signature.",
        )

    return original_name, detected_mime


def get_upload_directory(student_id: int) -> Path:
    """Get and ensure student-specific upload directory."""
    base_dir = Path(settings.UPLOAD_DIR).resolve()
    student_dir = base_dir / str(student_id)
    student_dir.mkdir(parents=True, exist_ok=True)
    return student_dir


def save_student_document(
    db: Session,
    student_id: int,
    file: UploadFile,
    content: bytes,
    document_type: DocumentType,
    assessment_id: int | None = None,
) -> Document:
    """Validate, safely store file to isolated directory, and persist metadata."""
    # Verify student exists
    student = db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    clean_name, detected_mime = validate_upload_file(file, content)
    ext = Path(clean_name).suffix.lower()

    # Generate internal safe unique filename
    internal_name = f"{uuid.uuid4().hex}{ext}"
    student_dir = get_upload_directory(student_id)
    file_path = student_dir / internal_name

    # Write file safely
    with open(file_path, "wb") as f:
        f.write(content)

    # Relative path stored in DB to avoid exposing absolute machine paths
    relative_path = f"{student_id}/{internal_name}"

    doc = Document(
        student_id=student_id,
        assessment_id=assessment_id,
        document_type=document_type,
        file_name=clean_name,
        file_path=relative_path,
        mime_type=detected_mime,
        file_size=len(content),
        status=DocumentStatus.UPLOADED,
        extraction_status=ExtractionStatus.PENDING,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_student_documents(db: Session, student_id: int) -> list[Document]:
    """Retrieve all documents belonging to a student."""
    return list(
        db.scalars(
            select(Document)
            .where(Document.student_id == student_id)
            .order_by(Document.created_at.desc())
        ).all()
    )


def get_document_by_id(db: Session, document_id: int) -> Document:
    """Retrieve a single document by ID or raise 404."""
    doc = db.scalar(select(Document).where(Document.id == document_id))
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )
    return doc


def get_document_filepath(doc: Document) -> Path:
    """Resolve physical filepath safely without path traversal."""
    base_dir = Path(settings.UPLOAD_DIR).resolve()
    target_path = (base_dir / doc.file_path).resolve()

    # Security check: must remain within base upload directory
    if not str(target_path).startswith(str(base_dir)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to target file path is forbidden.",
        )

    if not target_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical document file not found on server.",
        )

    return target_path


def delete_document(db: Session, document_id: int) -> None:
    """Delete document physical file and database metadata."""
    doc = get_document_by_id(db, document_id)

    try:
        path = get_document_filepath(doc)
        if path.exists():
            path.unlink()
    except HTTPException:
        # File might already be gone from disk, proceed with DB cleanup
        pass

    db.delete(doc)
    db.commit()
