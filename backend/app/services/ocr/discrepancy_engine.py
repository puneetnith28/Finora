"""Discrepancy engine and human review flagger."""

import json
from dataclasses import dataclass
from decimal import Decimal
from enum import StrEnum
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus, DocumentType, ExtractionStatus
from app.models.financial_profile import FinancialProfile
from app.services.document_service import get_document_by_id, get_document_filepath
from app.services.ocr.domain_extractors import get_extractor_for_document_type
from app.services.ocr.parsers import extract_text_from_document_file


class DiscrepancySeverity(StrEnum):
    NONE = "none"
    MINOR = "minor"  # Within acceptable tolerance (<= 10%)
    MAJOR = "major"  # Exceeds tolerance (> 10%), triggers human review


@dataclass
class DiscrepancyReport:
    student_id: int
    document_id: int
    field_name: str
    user_entered_value: Decimal
    extracted_value: Decimal
    variance_amount: Decimal
    variance_percentage: float
    tolerance_percentage: float
    severity: DiscrepancySeverity
    needs_human_review: bool
    review_note: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "student_id": self.student_id,
            "document_id": self.document_id,
            "field_name": self.field_name,
            "user_entered_value": str(self.user_entered_value),
            "extracted_value": str(self.extracted_value),
            "variance_amount": str(self.variance_amount),
            "variance_percentage": round(self.variance_percentage, 2),
            "tolerance_percentage": self.tolerance_percentage,
            "severity": self.severity.value,
            "needs_human_review": self.needs_human_review,
            "review_note": self.review_note,
        }


def process_document_extraction(
    db: Session,
    document_id: int,
) -> Document:
    """Extract text from physical document, execute domain extractor, and persist evidence."""
    doc = get_document_by_id(db, document_id)
    doc_path = get_document_filepath(doc)

    # 1. Parse text from document using local stream parser or OCR fallback
    text, method, conf = extract_text_from_document_file(doc_path)

    # 2. Invoke domain-specific extractor
    extractor = get_extractor_for_document_type(doc.document_type)
    payload = extractor.extract(text)
    payload.confidence_score = conf
    payload.metadata["extraction_method"] = method

    # 3. Store evidence JSON in DB
    doc.extracted_data_json = json.dumps(payload.to_dict())
    doc.extraction_status = ExtractionStatus.EXTRACTED
    db.commit()
    db.refresh(doc)
    return doc


def evaluate_income_discrepancy(
    db: Session,
    student_id: int,
    document_id: int,
    tolerance_percent: float = 10.0,
) -> DiscrepancyReport:
    """Compare user-entered monthly income against document-extracted income."""
    doc = get_document_by_id(db, document_id)
    if doc.extraction_status != ExtractionStatus.EXTRACTED:
        doc = process_document_extraction(db, document_id)

    # Fetch student financial profile
    profile = db.scalar(
        select(FinancialProfile).where(FinancialProfile.student_id == student_id)
    )
    user_entered_monthly = (
        profile.monthly_income if (profile and profile.monthly_income is not None) else Decimal("0.0")
    )


    # Parse extracted evidence
    extracted_data = json.loads(doc.extracted_data_json or "{}")
    fields = extracted_data.get("fields", {})

    extracted_monthly = Decimal("0.0")

    if doc.document_type == DocumentType.SALARY_SLIP:
        if "gross_income_monthly" in fields:
            extracted_monthly = Decimal(str(fields["gross_income_monthly"]["value"]))
        elif "net_income_monthly" in fields:
            extracted_monthly = Decimal(str(fields["net_income_monthly"]["value"]))

    elif doc.document_type == DocumentType.ITR:
        if "derived_monthly_income" in fields:
            extracted_monthly = Decimal(str(fields["derived_monthly_income"]["value"]))
        elif "gross_total_income" in fields:
            extracted_monthly = (
                Decimal(str(fields["gross_total_income"]["value"])) / Decimal("12.0")
            ).quantize(Decimal("0.01"))

    # Compute variance
    if extracted_monthly > Decimal("0.0"):
        diff = abs(user_entered_monthly - extracted_monthly)
        var_pct = float((diff / extracted_monthly) * Decimal("100.0"))
    else:
        diff = Decimal("0.0")
        var_pct = 0.0

    needs_review = var_pct > tolerance_percent

    if needs_review:
        severity = DiscrepancySeverity.MAJOR
        # Update document status to NEEDS_REVIEW without rejecting applicant
        doc.status = DocumentStatus.NEEDS_REVIEW
        db.commit()

        direction = (
            "higher than" if user_entered_monthly > extracted_monthly else "lower than"
        )
        note = (
            f"Income discrepancy detected: Applicant entered ₹{user_entered_monthly:,.2f}/mo, "
            f"which is {var_pct:.1f}% {direction} verified document income of ₹{extracted_monthly:,.2f}/mo. "
            f"Flagged for human underwriter review."
        )
    else:
        severity = DiscrepancySeverity.MINOR if var_pct > 0 else DiscrepancySeverity.NONE
        doc.status = DocumentStatus.VERIFIED
        db.commit()
        note = f"Income verified within acceptable tolerance ({var_pct:.1f}% variance)."

    return DiscrepancyReport(
        student_id=student_id,
        document_id=document_id,
        field_name="monthly_income_inr",
        user_entered_value=user_entered_monthly,
        extracted_value=extracted_monthly,
        variance_amount=diff,
        variance_percentage=var_pct,
        tolerance_percentage=tolerance_percent,
        severity=severity,
        needs_human_review=needs_review,
        review_note=note,
    )
