from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import DocumentType
from app.schemas.document import DocumentResponse
from app.services.document_service import (
    delete_document,
    get_document_by_id,
    get_document_filepath,
    get_student_documents,
    save_student_document,
)

router = APIRouter(tags=["Documents"])


@router.post(
    "/students/{student_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a student document with validation",
)
async def upload_document(
    student_id: int,
    file: UploadFile = File(...),
    document_type: DocumentType = Form(default=DocumentType.OTHER),
    assessment_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    """Upload, validate, safely store document and record metadata."""
    content = await file.read()
    doc = save_student_document(
        db=db,
        student_id=student_id,
        file=file,
        content=content,
        document_type=document_type,
        assessment_id=assessment_id,
    )
    return doc


@router.get(
    "/students/{student_id}/documents",
    response_model=list[DocumentResponse],
    summary="Get all documents for a student",
)
def list_student_documents(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[DocumentResponse]:
    """Retrieve all uploaded documents and metadata for a student."""
    return get_student_documents(db, student_id)


@router.get(
    "/students/{student_id}/documents/readiness",
    summary="Evaluate document readiness against candidate profile and assessment context",
)
def get_student_document_readiness(
    student_id: int,
    db: Session = Depends(get_db),
) -> dict:
    """Evaluate document readiness rules and return compliance checklist."""
    from app.services.document_readiness import evaluate_student_document_readiness

    report = evaluate_student_document_readiness(db, student_id)
    return {
        "student_id": report.student_id,
        "overall_readiness": report.overall_readiness.value,
        "total_required": report.total_required,
        "total_uploaded": report.total_uploaded,
        "total_verified": report.total_verified,
        "total_missing": report.total_missing,
        "items": [
            {
                "document_type": item.document_type.value,
                "title": item.title,
                "description": item.description,
                "mandatory": item.mandatory,
                "status": item.status.value,
                "uploaded_document_id": item.uploaded_document_id,
                "file_name": item.file_name,
                "uploaded_at": item.uploaded_at,
                "remedial_note": item.remedial_note,
            }
            for item in report.items
        ],
    }


@router.get(
    "/documents/{document_id}",
    response_model=DocumentResponse,
    summary="Get document metadata",
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
) -> DocumentResponse:
    """Retrieve metadata for a single document."""
    return get_document_by_id(db, document_id)


@router.get(
    "/documents/{document_id}/preview",
    summary="Safe preview or download of physical document file",
)
def preview_document_file(
    document_id: int,
    download: bool = False,
    db: Session = Depends(get_db),
) -> FileResponse:
    """Safely stream physical document without exposing filesystem paths."""
    doc = get_document_by_id(db, document_id)
    target_path = get_document_filepath(doc)

    disposition = "attachment" if download else "inline"
    return FileResponse(
        path=str(target_path),
        media_type=doc.mime_type,
        filename=doc.file_name,
        headers={"Content-Disposition": f"{disposition}; filename=\"{doc.file_name}\""},
    )


@router.post(
    "/documents/{document_id}/extract",
    summary="Trigger OCR/local extraction on document and persist evidence",
)
def extract_document_data(
    document_id: int,
    db: Session = Depends(get_db),
) -> dict:
    """Extract structured evidence from document and save to DB."""
    from app.services.ocr.discrepancy_engine import process_document_extraction

    doc = process_document_extraction(db, document_id)
    import json

    evidence = json.loads(doc.extracted_data_json or "{}")
    return {
        "document_id": doc.id,
        "document_type": doc.document_type.value,
        "extraction_status": doc.extraction_status.value,
        "status": doc.status.value,
        "evidence": evidence,
    }


@router.get(
    "/students/{student_id}/discrepancies",
    summary="Evaluate discrepancy between user profile and verified document evidence",
)
def check_student_discrepancies(
    student_id: int,
    tolerance_percent: float = 10.0,
    db: Session = Depends(get_db),
) -> list[dict]:
    """Compare student-entered income against all uploaded income documents (Salary slips, ITR)."""
    from app.services.ocr.discrepancy_engine import evaluate_income_discrepancy

    docs = get_student_documents(db, student_id)
    income_docs = [
        d for d in docs if d.document_type in (DocumentType.SALARY_SLIP, DocumentType.ITR)
    ]

    reports = []
    for doc in income_docs:
        rep = evaluate_income_discrepancy(
            db=db,
            student_id=student_id,
            document_id=doc.id,
            tolerance_percent=tolerance_percent,
        )
        reports.append(rep.to_dict())

    return reports


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document and its stored file",
)
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
) -> Response:
    """Delete document physical file and database metadata."""
    delete_document(db, document_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

