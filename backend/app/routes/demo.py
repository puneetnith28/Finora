"""Demo seed endpoints for evaluator walkthroughs."""

from decimal import Decimal

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.seed_lenders import seed_demo_lenders
from app.db.session import get_db
from app.models.collateral import Collateral, CollateralType
from app.models.document import Document, DocumentStatus, DocumentType
from app.models.financial_profile import FinancialProfile
from app.models.funding_source import FundingSource, FundingSourceType
from app.models.student import Student
from app.models.study_plan import StudyPlan
from app.services.assessment_orchestrator import run_candidate_assessment

demo_router = APIRouter(prefix="/demo", tags=["Demo"])


DEMO_SCENARIOS = [
    {
        "name": "Aarav Mehta (Tier-1 Prime Approval)",
        "email": "aarav.mehta@example.com",
        "target_country": "USA",
        "target_university": "Carnegie Mellon University",
        "target_course": "MS in Computer Science",
        "cibil_score": 780,
        "tuition_fee": Decimal("48000.00"),
        "living_expenses": Decimal("18000.00"),
        "currency": "USD",
        "exchange_rate": Decimal("85.00"),
        "monthly_income": Decimal("160000.00"),
        "existing_obligations": Decimal("8000.00"),
        "collateral_type": CollateralType.PROPERTY,
        "collateral_value": Decimal("6000000.00"),
        "savings": Decimal("1500000.00"),
    },
    {
        "name": "Priya Sharma (Unsecured NBFC Specialist)",
        "email": "priya.sharma@example.com",
        "target_country": "UK",
        "target_university": "London School of Economics",
        "target_course": "MSc in Finance",
        "cibil_score": 725,
        "tuition_fee": Decimal("32000.00"),
        "living_expenses": Decimal("14000.00"),
        "currency": "GBP",
        "exchange_rate": Decimal("108.00"),
        "monthly_income": Decimal("95000.00"),
        "existing_obligations": Decimal("12000.00"),
        "collateral_type": None,
        "collateral_value": Decimal("0.0"),
        "savings": Decimal("800000.00"),
    },
    {
        "name": "Rohan Verma (High FOIR Stress Case)",
        "email": "rohan.verma@example.com",
        "target_country": "Canada",
        "target_university": "University of Toronto",
        "target_course": "Rotman MBA",
        "cibil_score": 660,
        "tuition_fee": Decimal("45000.00"),
        "living_expenses": Decimal("16000.00"),
        "currency": "CAD",
        "exchange_rate": Decimal("62.00"),
        "monthly_income": Decimal("55000.00"),
        "existing_obligations": Decimal("32000.00"),
        "collateral_type": None,
        "collateral_value": Decimal("0.0"),
        "savings": Decimal("200000.00"),
    },
    {
        "name": "Ananya Iyer (Scholarship & Low Gap)",
        "email": "ananya.iyer@example.com",
        "target_country": "Germany",
        "target_university": "TU Munich",
        "target_course": "MSc in Robotics",
        "cibil_score": 760,
        "tuition_fee": Decimal("1500.00"),
        "living_expenses": Decimal("12000.00"),
        "currency": "EUR",
        "exchange_rate": Decimal("92.00"),
        "monthly_income": Decimal("85000.00"),
        "existing_obligations": Decimal("5000.00"),
        "collateral_type": CollateralType.FIXED_DEPOSIT,
        "collateral_value": Decimal("1500000.00"),
        "savings": Decimal("600000.00"),
        "scholarship": Decimal("4000.00"),
    },
    {
        "name": "Vikram Patel (Conditional / Discrepancy Flag)",
        "email": "vikram.patel@example.com",
        "target_country": "Australia",
        "target_university": "University of Melbourne",
        "target_course": "Master of Data Science",
        "cibil_score": 695,
        "tuition_fee": Decimal("42000.00"),
        "living_expenses": Decimal("16000.00"),
        "currency": "AUD",
        "exchange_rate": Decimal("55.00"),
        "monthly_income": Decimal("72000.00"),
        "existing_obligations": Decimal("15000.00"),
        "collateral_type": CollateralType.PROPERTY,
        "collateral_value": Decimal("3000000.00"),
        "savings": Decimal("400000.00"),
        "flag_discrepancy": True,
    },
]


@demo_router.post(
    "/seed",
    status_code=status.HTTP_201_CREATED,
    summary="Seed 5 realistic demonstration candidate scenarios for review",
)
def seed_demo_scenarios(db: Session = Depends(get_db)):
    """Clear and populate rich demonstration candidates and execute baseline assessments."""
    # Ensure lenders are seeded
    seed_demo_lenders(db)

    seeded_results = []
    for sc in DEMO_SCENARIOS:
        # Check or create student
        student = db.query(Student).filter(Student.email == sc["email"]).first()
        if not student:
            student = Student(
                name=sc["name"],
                email=sc["email"],
                country_of_origin="India",
                target_country=sc["target_country"],
                target_university=sc["target_university"],
                target_course=sc["target_course"],
            )
            db.add(student)
            db.flush()

        # Study plan
        sp = db.query(StudyPlan).filter(StudyPlan.student_id == student.id).first()
        if not sp:
            sp = StudyPlan(
                student_id=student.id,
                tuition_fee=sc["tuition_fee"],
                living_expenses=sc["living_expenses"],
                currency=sc["currency"],
                duration_months=24,
                exchange_rate_to_inr=sc["exchange_rate"],
            )
            db.add(sp)

        # Funding sources
        db.query(FundingSource).filter(FundingSource.student_id == student.id).delete()
        if sc.get("savings", Decimal("0")) > 0:
            db.add(
                FundingSource(
                    student_id=student.id,
                    source_type=FundingSourceType.SAVINGS,
                    amount_original=sc["savings"],
                    currency="INR",
                    exchange_rate_to_inr=Decimal("1.0"),
                    verified=True,
                )
            )
        if sc.get("scholarship"):
            db.add(
                FundingSource(
                    student_id=student.id,
                    source_type=FundingSourceType.SCHOLARSHIP,
                    amount_original=sc["scholarship"],
                    currency=sc["currency"],
                    exchange_rate_to_inr=sc["exchange_rate"],
                    verified=True,
                )
            )

        # Financial profile
        fp = db.query(FinancialProfile).filter(FinancialProfile.student_id == student.id).first()
        if not fp:
            fp = FinancialProfile(
                student_id=student.id,
                monthly_income=sc["monthly_income"],
                existing_monthly_obligations=sc["existing_obligations"],
            )
            db.add(fp)
        else:
            fp.monthly_income = sc["monthly_income"]
            fp.existing_monthly_obligations = sc["existing_obligations"]

        # Collateral
        db.query(Collateral).filter(Collateral.student_id == student.id).delete()
        if sc.get("collateral_type"):
            db.add(
                Collateral(
                    student_id=student.id,
                    collateral_type=sc["collateral_type"],
                    market_value_inr=sc["collateral_value"],
                    eligible_value_inr=sc["collateral_value"] * Decimal("0.80"),
                )
            )

        # Documents
        db.query(Document).filter(Document.student_id == student.id).delete()
        doc = Document(
            student_id=student.id,
            document_type=DocumentType.ADMISSION_LETTER,
            file_name=f"{sc['name'].split()[0]}_Admission_Offer.pdf",
            file_path=f"/uploads/demo/{student.id}/offer.pdf",
            mime_type="application/pdf",
            file_size=102400,
            status=DocumentStatus.VERIFIED,
            extracted_data_json=f'{{"university": "{sc["target_university"]}", "course": "{sc["target_course"]}"}}',
        )
        db.add(doc)

        db.commit()

        # Run assessment evaluation
        report = run_candidate_assessment(student_id=student.id, db=db)
        seeded_results.append(
            {
                "student_id": student.id,
                "name": sc["name"],
                "email": sc["email"],
                "target_country": sc["target_country"],
                "assessment_id": report.assessment_id,
                "readiness_score": 85 if report.matching_lenders_count >= 2 else 65,
                "readiness_band": "Strong Readiness" if report.matching_lenders_count >= 2 else "Conditional",
                "matching_lenders_count": report.matching_lenders_count,
            }
        )

    return {
        "message": f"Successfully seeded and evaluated {len(seeded_results)} demo scenarios",
        "scenarios": seeded_results,
    }
