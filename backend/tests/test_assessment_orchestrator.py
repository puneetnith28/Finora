"""Integration tests for Full Assessment Orchestration and Complete End-to-End Evaluation."""

from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.seed_lenders import seed_demo_lenders
from app.db.session import SessionLocal, engine
from app.models.asset import Asset, AssetType
from app.models.collateral import Collateral, CollateralType
from app.models.financial_profile import FinancialProfile
from app.models.funding_source import FundingSource, FundingSourceType
from app.models.liability import Liability, LiabilityType
from app.models.student import Student
from app.models.study_plan import StudyPlan
from app.services.assessment_orchestrator import run_candidate_assessment


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_complete_assessment_orchestration() -> None:
    db: Session = SessionLocal()
    try:
        # 1. Seed demo lenders
        seed_demo_lenders(db)

        # 2. Create student fixture
        student = Student(
            name="Priya Patel",
            email="priya.patel@example.com",
            country_of_origin="India",
            target_country="USA",
            target_university="Carnegie Mellon University",
            target_course="MS in Information Systems",
        )
        db.add(student)
        db.flush()

        # 3. Create Study Plan ($50,000 tuition + $20,000 living)
        study_plan = StudyPlan(
            student_id=student.id,
            currency="USD",
            duration_months=24,
            tuition_fee=Decimal("50000.00"),
            living_expenses=Decimal("20000.00"),
            other_expenses=Decimal("2000.00"),
            exchange_rate_to_inr=Decimal("85.00"),
        )
        db.add(study_plan)

        # 4. Create Funding Source (Family Savings: 15,00,000 INR)
        funding = FundingSource(
            student_id=student.id,
            source_type=FundingSourceType.SAVINGS,
            amount_original=Decimal("1500000.00"),
            amount_inr=Decimal("1500000.00"),
            currency="INR",
            exchange_rate_to_inr=Decimal("1.00"),
            verified=True,
        )
        db.add(funding)

        # 5. Create Financial Profile (Monthly income: 1,20,000 INR)
        fin_profile = FinancialProfile(
            student_id=student.id,
            monthly_income=Decimal("120000.00"),
            existing_monthly_obligations=Decimal("10000.00"),
        )
        db.add(fin_profile)
        db.flush()

        # Add Asset (Mutual Funds: 10,00,000 INR)
        asset = Asset(
            student_id=student.id,
            asset_type=AssetType.MUTUAL_FUNDS,
            estimated_value_inr=Decimal("1000000.00"),
            is_liquid=True,
        )
        db.add(asset)

        # Add Liability (Vehicle Loan: 3,00,000 INR outstanding, 10,000 EMI)
        liability = Liability(
            student_id=student.id,
            liability_type=LiabilityType.VEHICLE_LOAN,
            outstanding_amount_inr=Decimal("300000.00"),
            monthly_emi_inr=Decimal("10000.00"),
        )
        db.add(liability)

        # Add Collateral (Property: 60,00,000 INR)
        collateral = Collateral(
            student_id=student.id,
            collateral_type=CollateralType.PROPERTY,
            market_value_inr=Decimal("6000000.00"),
        )
        db.add(collateral)
        db.commit()

        # 6. Run Complete Assessment
        report = run_candidate_assessment(student.id, db)

        # 7. Assert complete metrics
        assert report.student_id == student.id
        assert report.student_name == "Priya Patel"
        assert report.status == "completed"

        # Check study cost calculation (72000 * 85 = 6,120,000)
        assert report.financial_summary.study_cost.total_cost_inr == Decimal("6120000.00")

        # Check funding and gap (6,120,000 - 1,500,000 = 4,620,000)
        assert report.financial_summary.funding.total_funding_inr == Decimal("1500000.00")
        assert report.financial_summary.funding_gap.funding_gap_inr == Decimal("4620000.00")
        assert report.financial_summary.funding_gap.has_gap is True

        # Check net worth (10L - 3L = 7L)
        assert report.financial_summary.net_worth.net_worth_inr == Decimal("700000.00")

        # Check collateral (60L * 0.80 haircut = 48L eligible)
        assert report.financial_summary.collateral.total_eligible_value_inr == Decimal("4800000.00")

        # Check readiness score
        assert report.financial_summary.readiness_score > Decimal("0.00")

        # Check lender evaluation coverage
        assert report.total_lenders_evaluated == 4
        assert len(report.lender_evaluations) == 4
        for lender_eval in report.lender_evaluations:
            assert lender_eval.outcome_state in ["potential_match", "needs_review", "not_a_match"]
            assert len(lender_eval.rule_results) > 0
            assert "Indicative assessment based on provided data" in lender_eval.disclaimer

    finally:
        db.close()
