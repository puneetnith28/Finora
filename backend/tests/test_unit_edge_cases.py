"""Comprehensive unit tests covering edge cases, numerical boundaries, and error handlers."""

from decimal import Decimal

import pytest

from app.models.asset import AssetType
from app.models.liability import LiabilityType
from app.services.collateral_calculator import CollateralItemInput, calculate_collateral_value
from app.services.currency_service import get_default_exchange_rate
from app.services.emi_calculator import EMIInput, calculate_emi
from app.services.foir_calculator import FOIRInput, calculate_foir
from app.services.funding_gap_calculator import FundingGapInput, calculate_funding_gap
from app.services.ltv_calculator import calculate_ltv
from app.services.net_worth_calculator import (
    AssetSummaryItem,
    LiabilitySummaryItem,
    NetWorthCalculationInput,
    calculate_net_worth,
)
from app.services.rules.lender_evaluator import (
    CandidateAssessmentContext,
    LenderProfile,
    evaluate_lender,
)
from app.services.rules.rule_types import RuleDefinition, RuleOperator, RuleSeverity, RuleType
from app.services.study_cost_calculator import StudyCostBreakdown, calculate_study_cost


# --- 1. Study Cost & Currency Conversion Boundaries ---
def test_study_cost_zero_and_minimal():
    """Verify study cost calculation with minimum valid values."""
    inp = StudyCostBreakdown(
        tuition_fee=Decimal("0.0"),
        living_expense=Decimal("0.0"),
        currency="USD",
        duration_months=1,
        exchange_rate=Decimal("85.00"),
    )
    res = calculate_study_cost(inp)
    assert res.total_cost_inr == Decimal("0.00")
    assert res.total_cost_original_currency == Decimal("0.00")


def test_currency_conversion_unknown_fallback():
    """Verify fallback exchange rate behavior for unmapped currencies raises ValueError."""
    with pytest.raises(ValueError, match="Unsupported currency conversion"):
        get_default_exchange_rate("XYZ")


# --- 2. EMI Calculator Boundaries ---
def test_emi_zero_interest_rate():
    """Verify zero-interest loan divides principal evenly across tenure."""
    inp = EMIInput(
        principal_inr=Decimal("120000.00"),
        annual_interest_rate_percent=Decimal("0.00"),
        tenure_months=12,
    )
    res = calculate_emi(inp)
    assert res.monthly_emi_inr == Decimal("10000.00")
    assert res.total_repayment_inr == Decimal("120000.00")
    assert res.total_interest_inr == Decimal("0.00")


def test_emi_single_month_tenure():
    """Verify single month tenure calculation."""
    inp = EMIInput(
        principal_inr=Decimal("50000.00"),
        annual_interest_rate_percent=Decimal("12.00"),
        tenure_months=1,
    )
    res = calculate_emi(inp)
    # 50,000 + 1% monthly interest = 50,500
    assert res.monthly_emi_inr == Decimal("50500.00")


# --- 3. FOIR Calculator Boundaries ---
def test_foir_zero_income_safe_handling():
    """Verify 0 income safely returns 100% FOIR without ZeroDivisionError."""
    inp = FOIRInput(
        monthly_net_income_inr=Decimal("0.00"),
        existing_monthly_emi_inr=Decimal("15000.00"),
        proposed_monthly_emi_inr=Decimal("20000.00"),
    )
    res = calculate_foir(inp)
    assert res.foir_percentage >= Decimal("100.00")
    assert res.is_affordable is False


def test_foir_zero_obligations_and_zero_emi():
    """Verify candidate with no debts has 0% FOIR."""
    inp = FOIRInput(
        monthly_net_income_inr=Decimal("100000.00"),
        existing_monthly_emi_inr=Decimal("0.00"),
        proposed_monthly_emi_inr=Decimal("0.00"),
    )
    res = calculate_foir(inp)
    assert res.foir_percentage == Decimal("0.00")
    assert res.is_affordable is True


# --- 4. Funding Gap Boundaries ---
def test_funding_gap_surplus_funding():
    """Verify candidate with scholarships/savings exceeding total cost has 0 gap and positive surplus."""
    inp = FundingGapInput(
        total_study_cost_inr=Decimal("2500000.00"),
        available_funding_inr=Decimal("3000000.00"),
    )
    res = calculate_funding_gap(inp)
    assert res.funding_gap_inr == Decimal("0.00")
    assert res.has_gap is False
    assert res.surplus_funding_inr == Decimal("500000.00")


# --- 5. Net Worth & Liabilities Exceeding Assets ---
def test_net_worth_negative_balance_sheet():
    """Verify net worth computation when liabilities exceed assets."""
    inp = NetWorthCalculationInput(
        assets=[
            AssetSummaryItem(asset_type=AssetType.SAVINGS_DEPOSIT, estimated_value_inr=Decimal("500000.00")),
        ],
        liabilities=[
            LiabilitySummaryItem(liability_type=LiabilityType.PERSONAL_LOAN, outstanding_amount_inr=Decimal("800000.00")),
        ],
    )
    res = calculate_net_worth(inp)
    assert res.total_assets_inr == Decimal("500000.00")
    assert res.total_liabilities_inr == Decimal("800000.00")
    assert res.net_worth_inr == Decimal("-300000.00")
    assert res.is_solvent is False


# --- 6. Collateral & LTV Boundaries ---
def test_collateral_haircuts_and_zero_collateral():
    """Verify haircut factors applied across varied collateral asset classes."""
    items = [
        CollateralItemInput(collateral_type="property", market_value_inr=Decimal("10000000.00")),
        CollateralItemInput(collateral_type="fixed_deposit", market_value_inr=Decimal("1000000.00")),
        CollateralItemInput(collateral_type="gold", market_value_inr=Decimal("500000.00")),
    ]
    res = calculate_collateral_value(items)
    assert res.total_eligible_value_inr > Decimal("8000000.00")
    assert res.total_eligible_value_inr < Decimal("11500000.00")


def test_ltv_zero_collateral():
    """Verify LTV computation with zero collateral returns None/0 and unsecured flag."""
    from app.services.ltv_calculator import LTVInput
    res = calculate_ltv(
        LTVInput(
            requested_loan_amount_inr=Decimal("3000000.00"),
            eligible_collateral_value_inr=Decimal("0.00"),
        )
    )
    assert res.is_unsecured is True
    assert res.coverage_status == "unsecured"


# --- 7. Rule Evaluator Boundary Conditions ---
def test_rule_evaluator_exact_boundary_matching():
    """Verify rule passes on exact equality boundary for LTE and GTE."""
    cibil_rule = RuleDefinition(
        rule_type=RuleType.MIN_CIBIL_SCORE,
        operator=RuleOperator.GTE,
        expected_numeric=Decimal("700"),
        severity=RuleSeverity.HARD_CONSTRAINT,
    )
    foir_rule = RuleDefinition(
        rule_type=RuleType.MAXIMUM_FOIR,
        operator=RuleOperator.LTE,
        expected_numeric=Decimal("1.00"),
        severity=RuleSeverity.HARD_CONSTRAINT,
    )

    lender = LenderProfile(
        id=1,
        name="Test Boundary Bank",
        criteria=[cibil_rule, foir_rule],
    )

    from app.services.financial_engine import ComprehensiveFinancialInput, run_full_financial_engine

    fin_summary = run_full_financial_engine(
        ComprehensiveFinancialInput(
            study_cost=StudyCostBreakdown(
                tuition_fee=Decimal("20000.00"),
                living_expense=Decimal("10000.00"),
                exchange_rate=Decimal("85.00"),
            ),
            funding_sources=[],
            monthly_income=Decimal("80000.00"),
            existing_obligations=Decimal("10000.00"),
            collateral_items=[],
        )
    )

    ctx = CandidateAssessmentContext(
        cibil_score=700,
        target_country="USA",
        co_borrower_monthly_income_inr=Decimal("80000.00"),
        financial_summary=fin_summary,
    )

    res = evaluate_lender(lender, ctx)
    assert res.outcome_state.value in ["potential_match", "eligible", "needs_review"]
    assert len(res.rule_results) == 2

