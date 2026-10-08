"""Comprehensive End-to-End Tests for Deterministic Financial Engine."""

from decimal import Decimal

from app.models.asset import AssetType
from app.models.collateral import CollateralType, OwnershipStatus
from app.models.funding_source import FundingSourceType
from app.models.liability import LiabilityType
from app.services.collateral_calculator import CollateralItemInput
from app.services.financial_engine import (
    ComprehensiveFinancialInput,
    run_full_financial_engine,
)
from app.services.funding_calculator import FundingItem
from app.services.net_worth_calculator import AssetSummaryItem, LiabilitySummaryItem
from app.services.study_cost_calculator import StudyCostBreakdown


def test_full_financial_engine_strong_secured_candidate() -> None:
    """Test standard prime candidate with study plan, partial funding, strong property collateral, and solid co-borrower income."""
    # US Masters: 24 months, $80k tuition + $30k living + $4k travel + $3k ins + $3k other = $120k * 85 = 10.2M INR
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("80000.00"),
        living_expense=Decimal("30000.00"),
        travel_expense=Decimal("4000.00"),
        insurance_expense=Decimal("3000.00"),
        other_expense=Decimal("3000.00"),
        duration_months=24,
        currency="USD",
        exchange_rate=Decimal("85.00"),
    )

    # Funding: 2.2M INR (Savings + Scholarship)
    funding_sources = [
        FundingItem(
            funding_type=FundingSourceType.SAVINGS,
            source_name="Family Fixed Deposit",
            amount=Decimal("1500000.00"),
            currency="INR",
        ),
        FundingItem(
            funding_type=FundingSourceType.SCHOLARSHIP,
            source_name="Dean Excellence Award",
            amount=Decimal("8235.29"),  # ~$700,000 INR
            currency="USD",
            exchange_rate=Decimal("85.00"),
        ),
    ]

    # Assets & Liabilities
    assets = [
        AssetSummaryItem(
            asset_type=AssetType.PROPERTY,
            description="Family Home Bangalore",
            estimated_value_inr=Decimal("15000000.00"),
            is_liquid=False,
        ),
        AssetSummaryItem(
            asset_type=AssetType.SAVINGS_DEPOSIT,
            estimated_value_inr=Decimal("1500000.00"),
            is_liquid=True,
        ),
    ]
    liabilities = [
        LiabilitySummaryItem(
            liability_type=LiabilityType.VEHICLE_LOAN,
            outstanding_amount_inr=Decimal("300000.00"),
            monthly_emi_inr=Decimal("10000.00"),
        )
    ]

    # Collateral: 15M property, 0 encumbrance -> 15M * 0.80 = 12M eligible
    collaterals = [
        CollateralItemInput(
            collateral_type=CollateralType.PROPERTY,
            ownership_status=OwnershipStatus.JOINT_PARENT,
            market_value_inr=Decimal("15000000.00"),
            existing_encumbrance_inr=Decimal("0.00"),
        )
    ]

    payload = ComprehensiveFinancialInput(
        study_cost=study_cost,
        funding_sources=funding_sources,
        assets=assets,
        liabilities=liabilities,
        collaterals=collaterals,
        monthly_net_income_inr=Decimal("250000.00"),  # 2.5L / month
        requested_loan_amount_inr=Decimal("8000000.00"),  # 80L requested
        expected_interest_rate_percent=Decimal("10.50"),
        loan_tenure_months=120,
    )

    summary = run_full_financial_engine(payload)

    # Verify study cost
    assert summary.study_cost.total_cost_inr == Decimal("10200000.00")
    # Verify funding gap
    assert summary.funding_gap.has_gap is True
    # Verify collateral
    assert summary.collateral.total_eligible_value_inr == Decimal("12000000.00")
    # Verify LTV: 8M / 12M = 66.67%
    assert summary.ltv.coverage_status == "fully_secured"
    assert summary.ltv.ltv_ratio == Decimal("0.6667")
    # Verify Net worth: 16.5M - 0.3M = 16.2M
    assert summary.net_worth.net_worth_inr == Decimal("16200000.00")
    # Verify readiness
    assert summary.readiness_score >= Decimal("70.00")
    assert summary.readiness_band in ["strong", "excellent"]


def test_full_financial_engine_fully_funded_candidate() -> None:
    """Test candidate with full scholarship and savings where no loan is needed."""
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("30000.00"),
        living_expense=Decimal("15000.00"),
        travel_expense=Decimal("2000.00"),
        insurance_expense=Decimal("1000.00"),
        other_expense=Decimal("2000.00"),
        duration_months=12,
        currency="USD",
        exchange_rate=Decimal("85.00"),
    )

    funding_sources = [
        FundingItem(
            funding_type=FundingSourceType.SCHOLARSHIP,
            source_name="Full Tuition Fellowship",
            amount=Decimal("30000.00"),
            currency="USD",
            exchange_rate=Decimal("85.00"),
        ),
        FundingItem(
            funding_type=FundingSourceType.SAVINGS,
            source_name="Self Savings",
            amount=Decimal("2000000.00"),
            currency="INR",
        ),
    ]

    payload = ComprehensiveFinancialInput(
        study_cost=study_cost,
        funding_sources=funding_sources,
        monthly_net_income_inr=Decimal("100000.00"),
    )

    summary = run_full_financial_engine(payload)

    assert summary.funding_gap.has_gap is False
    assert summary.funding_gap.surplus_funding_inr > Decimal("0.00")
    assert summary.funding_gap.recommended_loan_amount_inr == Decimal("0.00")
    assert summary.readiness_score >= Decimal("70.00")
    assert summary.readiness_band in ["strong", "excellent"]


def test_full_financial_engine_distressed_high_foir_candidate() -> None:
    """Test overleveraged candidate with critical FOIR burden and no collateral."""
    study_cost = StudyCostBreakdown(
        tuition_fee=Decimal("50000.00"),
        living_expense=Decimal("20000.00"),
        duration_months=12,
        currency="USD",
        exchange_rate=Decimal("85.00"),
    )

    assets = [
        AssetSummaryItem(
            asset_type=AssetType.SAVINGS_DEPOSIT,
            estimated_value_inr=Decimal("50000.00"),
            is_liquid=True,
        )
    ]
    liabilities = [
        LiabilitySummaryItem(
            liability_type=LiabilityType.PERSONAL_LOAN,
            outstanding_amount_inr=Decimal("1000000.00"),
            monthly_emi_inr=Decimal("35000.00"),
        )
    ]

    payload = ComprehensiveFinancialInput(
        study_cost=study_cost,
        assets=assets,
        liabilities=liabilities,
        monthly_net_income_inr=Decimal("40000.00"),
        requested_loan_amount_inr=Decimal("5000000.00"),
    )

    summary = run_full_financial_engine(payload)

    assert summary.foir.is_affordable is False
    assert summary.foir.risk_category == "critical_risk"
    assert summary.ltv.coverage_status == "unsecured"
    assert summary.readiness_band in ["weak", "high_risk"]
