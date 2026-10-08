"""Document readiness rule engine based on candidate profile and assessment context."""

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.collateral import Collateral
from app.models.document import Document, DocumentStatus, DocumentType
from app.models.financial_profile import FinancialProfile
from app.models.funding_source import FundingSource
from app.models.student import Student


class OverallReadinessState(StrEnum):
    READY = "ready"
    PARTIALLY_READY = "partially_ready"
    ACTION_REQUIRED = "action_required"


@dataclass
class RequiredDocumentCheck:
    document_type: DocumentType
    title: str
    description: str
    mandatory: bool
    status: DocumentStatus
    uploaded_document_id: int | None = None
    file_name: str | None = None
    uploaded_at: str | None = None
    remedial_note: str | None = None


@dataclass
class DocumentReadinessReport:
    student_id: int
    overall_readiness: OverallReadinessState
    total_required: int
    total_uploaded: int
    total_verified: int
    total_missing: int
    items: list[RequiredDocumentCheck] = field(default_factory=list)


def evaluate_student_document_readiness(
    db: Session,
    student_id: int,
) -> DocumentReadinessReport:
    """Evaluate document readiness requirements according to student's specific profile context."""
    student = db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise ValueError(f"Student with id {student_id} not found")

    # Fetch active uploaded documents
    uploaded_docs = list(
        db.scalars(select(Document).where(Document.student_id == student_id)).all()
    )
    doc_map: dict[str, Document] = {}
    for d in uploaded_docs:
        doc_map[d.document_type.value] = d

    # Fetch context to determine dynamic mandates
    funding_sources = list(
        db.scalars(select(FundingSource).where(FundingSource.student_id == student_id)).all()
    )
    has_scholarship = any(s.source_type.value == "scholarship" for s in funding_sources)
    has_large_savings = any(s.amount_inr >= 500000 for s in funding_sources)

    financial_profile = db.scalar(
        select(FinancialProfile).where(FinancialProfile.student_id == student_id)
    )
    has_income = financial_profile is not None and financial_profile.monthly_income_inr > 0

    collaterals = list(
        db.scalars(select(Collateral).where(Collateral.student_id == student_id)).all()
    )
    has_collateral = len(collaterals) > 0

    required_checks: list[RequiredDocumentCheck] = []

    # 1. Mandatory Academic: Admission Offer Letter
    adm_doc = doc_map.get(DocumentType.ADMISSION_LETTER.value)
    required_checks.append(
        RequiredDocumentCheck(
            document_type=DocumentType.ADMISSION_LETTER,
            title="University Admission / Offer Letter",
            description="Unconditional or conditional admission letter from the destination university.",
            mandatory=True,
            status=adm_doc.status if adm_doc else DocumentStatus.MISSING,
            uploaded_document_id=adm_doc.id if adm_doc else None,
            file_name=adm_doc.file_name if adm_doc else None,
            uploaded_at=adm_doc.uploaded_at.isoformat() if adm_doc else None,
            remedial_note=None if adm_doc else "Upload your official offer letter for lender sanction.",
        )
    )

    # 2. Mandatory Identity: Passport
    pass_doc = doc_map.get(DocumentType.PASSPORT.value)
    required_checks.append(
        RequiredDocumentCheck(
            document_type=DocumentType.PASSPORT,
            title="Passport / Government ID Proof",
            description="Valid passport copy for KYC and foreign outward remittance verification.",
            mandatory=True,
            status=pass_doc.status if pass_doc else DocumentStatus.MISSING,
            uploaded_document_id=pass_doc.id if pass_doc else None,
            file_name=pass_doc.file_name if pass_doc else None,
            uploaded_at=pass_doc.uploaded_at.isoformat() if pass_doc else None,
            remedial_note=None if pass_doc else "Upload passport front and back pages.",
        )
    )

    # 3. Income Assessment: Salary Slip or ITR
    if has_income or True:  # Education loans universally require co-borrower income proof
        salary_doc = doc_map.get(DocumentType.SALARY_SLIP.value)
        itr_doc = doc_map.get(DocumentType.ITR.value)
        income_doc = itr_doc or salary_doc

        required_checks.append(
            RequiredDocumentCheck(
                document_type=DocumentType.ITR if itr_doc else DocumentType.SALARY_SLIP,
                title="Co-Borrower Income Tax Returns (ITR) or Salary Slips",
                description="Last 2 years ITR-V with computation of income, or recent 3-6 months pay slips.",
                mandatory=True,
                status=income_doc.status if income_doc else DocumentStatus.MISSING,
                uploaded_document_id=income_doc.id if income_doc else None,
                file_name=income_doc.file_name if income_doc else None,
                uploaded_at=income_doc.uploaded_at.isoformat() if income_doc else None,
                remedial_note=None
                if income_doc
                else "Required to substantiate co-borrower FOIR and debt servicing ability.",
            )
        )

    # 4. Bank Statement
    bank_doc = doc_map.get(DocumentType.BANK_STATEMENT.value)
    required_checks.append(
        RequiredDocumentCheck(
            document_type=DocumentType.BANK_STATEMENT,
            title="Co-Borrower 6-Month Bank Statement",
            description="Operational bank account statement showing salary credit or business turnover.",
            mandatory=True,
            status=bank_doc.status if bank_doc else DocumentStatus.MISSING,
            uploaded_document_id=bank_doc.id if bank_doc else None,
            file_name=bank_doc.file_name if bank_doc else None,
            uploaded_at=bank_doc.uploaded_at.isoformat() if bank_doc else None,
            remedial_note=None
            if bank_doc
            else "Required by banks to check average balance and EMI clearing.",
        )
    )

    # 5. Collateral Deed (Contextual: only if pledging collateral)
    if has_collateral:
        prop_doc = doc_map.get(DocumentType.PROPERTY_DOCUMENT.value) or doc_map.get(
            DocumentType.COLLATERAL_DEED.value
        )
        required_checks.append(
            RequiredDocumentCheck(
                document_type=DocumentType.PROPERTY_DOCUMENT,
                title="Property Title Deed & Encumbrance Certificate",
                description="Registered title deed and 13-year non-encumbrance certificate for pledged property.",
                mandatory=True,
                status=prop_doc.status if prop_doc else DocumentStatus.MISSING,
                uploaded_document_id=prop_doc.id if prop_doc else None,
                file_name=prop_doc.file_name if prop_doc else None,
                uploaded_at=prop_doc.uploaded_at.isoformat() if prop_doc else None,
                remedial_note=None
                if prop_doc
                else "Mandatory because collateral is pledged in your financial profile.",
            )
        )

    # 6. Scholarship Proof (Contextual: only if scholarship claimed)
    if has_scholarship:
        schol_doc = doc_map.get(DocumentType.SCHOLARSHIP_PROOF.value)
        required_checks.append(
            RequiredDocumentCheck(
                document_type=DocumentType.SCHOLARSHIP_PROOF,
                title="Scholarship Award Letter",
                description="Official letter confirming grant amount and disbursement schedule.",
                mandatory=True,
                status=schol_doc.status if schol_doc else DocumentStatus.MISSING,
                uploaded_document_id=schol_doc.id if schol_doc else None,
                file_name=schol_doc.file_name if schol_doc else None,
                uploaded_at=schol_doc.uploaded_at.isoformat() if schol_doc else None,
                remedial_note=None
                if schol_doc
                else "Mandatory to verify self-funding deduction claim.",
            )
        )

    total_req = len(required_checks)
    total_upl = sum(1 for c in required_checks if c.status != DocumentStatus.MISSING)
    total_ver = sum(1 for c in required_checks if c.status == DocumentStatus.VERIFIED)
    total_mis = sum(1 for c in required_checks if c.status == DocumentStatus.MISSING)

    if total_mis == 0 and total_ver >= total_req - 1:
        overall = OverallReadinessState.READY
    elif total_upl > 0:
        overall = OverallReadinessState.PARTIALLY_READY
    else:
        overall = OverallReadinessState.ACTION_REQUIRED

    return DocumentReadinessReport(
        student_id=student_id,
        overall_readiness=overall,
        total_required=total_req,
        total_uploaded=total_upl,
        total_verified=total_ver,
        total_missing=total_mis,
        items=required_checks,
    )
