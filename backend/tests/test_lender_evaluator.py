"""Unit tests for lender evaluator, outcomes, hard constraints, and review rules."""

from decimal import Decimal

from app.services.financial_engine import (
    ComprehensiveFinancialInput,
    run_full_financial_engine,
)
from app.services.rules.lender_evaluator import (
    CandidateAssessmentContext,
    LenderOutcomeState,
    LenderProfile,
    evaluate_lender,
)
from app.services.rules.rule_types import (
    RuleDefinition,
    RuleOperator,
    RuleSeverity,
    RuleType,
)
from app.services.study_cost_calculator import StudyCostBreakdown


def test_lender_evaluation_potential_match() -> None:
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("40000.00"),
        living_expense=Decimal("15000.00"),
        duration_months=12,
        currency="USD",
        exchange_rate=Decimal("85.00"),
    )
    fin_summary = run_full_financial_engine(
        ComprehensiveFinancialInput(
            study_cost=study_cost,
            monthly_net_income_inr=Decimal("150000.00"),
            requested_loan_amount_inr=Decimal("3000000.00"),
        )
    )

    context = CandidateAssessmentContext(
        target_country="USA",
        target_course_level="masters",
        cibil_score=750,
        has_collateral=False,
        co_borrower_monthly_income_inr=Decimal("150000.00"),
        documents_uploaded=["passport.pdf", "offer_letter.pdf"],
        financial_summary=fin_summary,
    )

    lender = LenderProfile(
        id=1,
        name="Demo Prime Education Fund",
        criteria=[
            RuleDefinition(
                rule_type=RuleType.COUNTRY_ALLOWED,
                operator=RuleOperator.IN,
                expected_list=["USA", "UK", "Canada"],
                severity=RuleSeverity.HARD_CONSTRAINT,
            ),
            RuleDefinition(
                rule_type=RuleType.MIN_CIBIL_SCORE,
                operator=RuleOperator.GTE,
                expected_numeric=Decimal("700"),
                severity=RuleSeverity.HARD_CONSTRAINT,
            ),
            RuleDefinition(
                rule_type=RuleType.MAXIMUM_LOAN_AMOUNT,
                operator=RuleOperator.LTE,
                expected_numeric=Decimal("5000000.00"),
                severity=RuleSeverity.HARD_CONSTRAINT,
            ),
        ],
    )

    result = evaluate_lender(lender, context)
    assert result.outcome_state == LenderOutcomeState.POTENTIAL_MATCH
    assert result.match_score == Decimal("100.00")
    assert result.failed_rules_count == 0
    assert len(result.failed_hard_constraints) == 0


def test_lender_evaluation_hard_constraint_failure() -> None:
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("40000.00"),
        duration_months=12,
        currency="USD",
    )
    fin_summary = run_full_financial_engine(
        ComprehensiveFinancialInput(
            study_cost=study_cost,
            requested_loan_amount_inr=Decimal("8000000.00"),  # 80L
        )
    )
    context = CandidateAssessmentContext(
        target_country="Australia",
        financial_summary=fin_summary,
    )

    lender = LenderProfile(
        id=2,
        name="Demo USA-Only NBFC",
        criteria=[
            RuleDefinition(
                rule_type=RuleType.COUNTRY_ALLOWED,
                operator=RuleOperator.IN,
                expected_list=["USA"],
                severity=RuleSeverity.HARD_CONSTRAINT,
            ),
            RuleDefinition(
                rule_type=RuleType.MAXIMUM_LOAN_AMOUNT,
                operator=RuleOperator.LTE,
                expected_numeric=Decimal("5000000.00"),  # Max 50L
                severity=RuleSeverity.HARD_CONSTRAINT,
            ),
        ],
    )

    result = evaluate_lender(lender, context)
    assert result.outcome_state == LenderOutcomeState.NOT_A_MATCH
    assert len(result.failed_hard_constraints) == 2
    # Ensure failed rules are never hidden
    assert result.failed_rules_count == 2
    assert all(not r.passed for r in result.failed_hard_constraints)


def test_lender_evaluation_needs_review() -> None:
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("30000.00"),
        duration_months=12,
        currency="USD",
    )
    fin_summary = run_full_financial_engine(
        ComprehensiveFinancialInput(
            study_cost=study_cost,
            monthly_net_income_inr=Decimal("80000.00"),
        )
    )
    context = CandidateAssessmentContext(
        target_country="UK",
        documents_uploaded=[],  # No documents uploaded
        financial_summary=fin_summary,
    )

    lender = LenderProfile(
        id=3,
        name="Demo Bank with Document Review",
        criteria=[
            RuleDefinition(
                rule_type=RuleType.COUNTRY_ALLOWED,
                operator=RuleOperator.IN,
                expected_list=["UK", "USA"],
                severity=RuleSeverity.HARD_CONSTRAINT,
            ),
            RuleDefinition(
                rule_type=RuleType.DOCUMENT_REQUIRED,
                operator=RuleOperator.REQUIRED,
                severity=RuleSeverity.REVIEW,  # Review severity
                description="Salary slips and KYC mandatory for final approval",
            ),
        ],
    )

    result = evaluate_lender(lender, context)
    assert result.outcome_state == LenderOutcomeState.NEEDS_REVIEW
    assert len(result.review_triggers) == 1
    assert len(result.failed_hard_constraints) == 0
    assert result.failed_rules_count == 1
    assert result.review_triggers[0].rule_type == "document_required"
    assert "Salary slips and KYC mandatory" in result.review_triggers[0].description


def test_lender_evaluation_collateral_hard_constraint() -> None:
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("60000.00"),
        duration_months=24,
        currency="USD",
    )
    fin_summary = run_full_financial_engine(
        ComprehensiveFinancialInput(
            study_cost=study_cost,
            requested_loan_amount_inr=Decimal("6000000.00"),
        )
    )
    context = CandidateAssessmentContext(
        target_country="USA",
        has_collateral=False,
        financial_summary=fin_summary,
    )

    lender = LenderProfile(
        id=4,
        name="Demo Secured-Only Bank",
        criteria=[
            RuleDefinition(
                rule_type=RuleType.COLLATERAL_REQUIRED,
                operator=RuleOperator.REQUIRED,
                severity=RuleSeverity.HARD_CONSTRAINT,
                description="Secured collateral mandatory for loans above 40L",
            ),
            RuleDefinition(
                rule_type=RuleType.MAXIMUM_FOIR,
                operator=RuleOperator.LTE,
                expected_numeric=Decimal("0.50"),
                severity=RuleSeverity.REVIEW,
            ),
        ],
    )

    result = evaluate_lender(lender, context)
    assert result.outcome_state == LenderOutcomeState.NOT_A_MATCH
    assert len(result.failed_hard_constraints) == 1
    assert result.failed_hard_constraints[0].rule_type == "collateral_required"
    # Even if review rule fails or passes, hard constraint dictates NOT_A_MATCH
    assert not result.failed_hard_constraints[0].passed
    assert result.failed_hard_constraints[0].actual_value == "False"
    assert result.disclaimer == "Indicative assessment based on provided data. Not a guaranteed sanction or formal loan offer."

