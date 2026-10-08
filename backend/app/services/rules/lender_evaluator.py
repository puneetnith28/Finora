"""Lender evaluation service mapping candidate financial profile against lender criteria."""

import enum
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field

from app.services.financial_engine import ComprehensiveFinancialSummary
from app.services.rules.rule_evaluator import (
    RuleEvaluationResult,
    evaluate_single_rule,
)
from app.services.rules.rule_types import (
    RuleDefinition,
    RuleSeverity,
    RuleType,
)


class LenderOutcomeState(enum.StrEnum):
    POTENTIAL_MATCH = "potential_match"
    NEEDS_REVIEW = "needs_review"
    NOT_A_MATCH = "not_a_match"


class LenderProfile(BaseModel):
    id: int
    name: str
    description: str | None = None
    active: bool = True
    criteria: list[RuleDefinition] = Field(default_factory=list)


class CandidateAssessmentContext(BaseModel):
    target_country: str = "USA"
    target_course_level: str = "masters"
    cibil_score: int | None = 750
    has_collateral: bool = False
    co_borrower_monthly_income_inr: Decimal = Decimal("0.00")
    documents_uploaded: list[str] = Field(default_factory=list)
    financial_summary: ComprehensiveFinancialSummary


class LenderEvaluationResult(BaseModel):
    lender_id: int
    lender_name: str
    outcome_state: LenderOutcomeState
    match_score: Decimal  # 0.00 - 100.00
    rule_results: list[RuleEvaluationResult]
    passed_rules_count: int
    failed_rules_count: int
    failed_hard_constraints: list[RuleEvaluationResult]
    review_triggers: list[RuleEvaluationResult]
    summary_reasons: list[str]
    disclaimer: str = "Indicative assessment based on provided data. Not a guaranteed sanction or formal loan offer."


def extract_context_value_for_rule(
    rule_type: RuleType,
    context: CandidateAssessmentContext,
) -> Any:
    """Extract candidate attribute corresponding to rule type."""
    fin = context.financial_summary

    if rule_type == RuleType.MINIMUM_INCOME:
        return context.co_borrower_monthly_income_inr
    if rule_type == RuleType.MAXIMUM_FOIR:
        return fin.foir.foir_ratio
    if rule_type == RuleType.MAXIMUM_LTV:
        return fin.ltv.ltv_ratio
    if rule_type == RuleType.MAXIMUM_LOAN_AMOUNT:
        return fin.emi.principal_inr
    if rule_type == RuleType.MINIMUM_COLLATERAL_VALUE:
        return fin.collateral.total_eligible_value_inr
    if rule_type == RuleType.COUNTRY_ALLOWED:
        return context.target_country
    if rule_type == RuleType.COURSE_LEVEL_ALLOWED:
        return context.target_course_level
    if rule_type == RuleType.COLLATERAL_REQUIRED:
        return context.has_collateral or fin.collateral.total_eligible_value_inr > 0
    if rule_type == RuleType.DOCUMENT_REQUIRED:
        return len(context.documents_uploaded) > 0
    if rule_type == RuleType.MIN_CIBIL_SCORE:
        return context.cibil_score
    if rule_type == RuleType.MIN_LIQUID_ASSETS_RATIO:
        if fin.study_cost.total_cost_inr > 0:
            return (fin.net_worth.total_liquid_assets_inr / fin.study_cost.total_cost_inr).quantize(
                Decimal("0.0001")
            )
        return Decimal("1.0000")

    return None


def evaluate_lender(
    lender: LenderProfile,
    context: CandidateAssessmentContext,
) -> LenderEvaluationResult:
    """Evaluate a candidate against a lender's full criteria set with transparent rule reporting."""
    rule_results: list[RuleEvaluationResult] = []
    failed_hard: list[RuleEvaluationResult] = []
    review_triggers: list[RuleEvaluationResult] = []
    summary_reasons: list[str] = []

    total_weight = Decimal("0.00")
    earned_weight = Decimal("0.00")

    for rule in lender.criteria:
        actual_val = extract_context_value_for_rule(rule.rule_type, context)
        result = evaluate_single_rule(rule, actual_val)
        rule_results.append(result)

        total_weight += rule.weight
        if result.passed:
            earned_weight += rule.weight
        else:
            if rule.severity == RuleSeverity.HARD_CONSTRAINT:
                failed_hard.append(result)
                summary_reasons.append(f"Hard constraint failed: {result.reason}")
            elif rule.severity == RuleSeverity.REVIEW:
                review_triggers.append(result)
                summary_reasons.append(f"Review required: {result.reason}")
            else:
                summary_reasons.append(f"Preference unmet: {result.reason}")

    # Determine Outcome State
    if len(failed_hard) > 0:
        outcome = LenderOutcomeState.NOT_A_MATCH
    elif len(review_triggers) > 0:
        outcome = LenderOutcomeState.NEEDS_REVIEW
    else:
        outcome = LenderOutcomeState.POTENTIAL_MATCH

    # Calculate match percentage
    if total_weight > Decimal("0.00"):
        match_score = ((earned_weight / total_weight) * Decimal("100.00")).quantize(Decimal("0.01"))
    else:
        match_score = (
            Decimal("100.00") if outcome != LenderOutcomeState.NOT_A_MATCH else Decimal("0.00")
        )

    if outcome == LenderOutcomeState.POTENTIAL_MATCH:
        summary_reasons.insert(0, "All lender underwriting criteria successfully met.")

    passed_count = sum(1 for r in rule_results if r.passed)
    failed_count = sum(1 for r in rule_results if not r.passed)

    return LenderEvaluationResult(
        lender_id=lender.id,
        lender_name=lender.name,
        outcome_state=outcome,
        match_score=match_score,
        rule_results=rule_results,
        passed_rules_count=passed_count,
        failed_rules_count=failed_count,
        failed_hard_constraints=failed_hard,
        review_triggers=review_triggers,
        summary_reasons=summary_reasons,
    )
