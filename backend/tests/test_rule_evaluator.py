"""Unit tests for rule evaluator."""

from decimal import Decimal

from app.services.rules.rule_evaluator import (
    evaluate_single_rule,
)
from app.services.rules.rule_types import (
    RuleDefinition,
    RuleOperator,
    RuleSeverity,
    RuleType,
)


def test_evaluate_rule_numeric_gte_pass() -> None:
    rule = RuleDefinition(
        rule_type=RuleType.MINIMUM_INCOME,
        operator=RuleOperator.GTE,
        expected_numeric=Decimal("50000.00"),
    )
    result = evaluate_single_rule(rule, Decimal("75000.00"))
    assert result.passed is True
    assert "satisfies minimum" in result.reason


def test_evaluate_rule_numeric_lte_fail() -> None:
    rule = RuleDefinition(
        rule_type=RuleType.MAXIMUM_FOIR,
        operator=RuleOperator.LTE,
        expected_numeric=Decimal("0.60"),
    )
    result = evaluate_single_rule(rule, Decimal("0.75"))
    assert result.passed is False
    assert "exceeds allowable maximum" in result.reason


def test_evaluate_rule_in_operator() -> None:
    rule = RuleDefinition(
        rule_type=RuleType.COUNTRY_ALLOWED,
        operator=RuleOperator.IN,
        expected_list=["USA", "UK", "Canada", "Germany"],
    )
    pass_res = evaluate_single_rule(rule, "USA")
    assert pass_res.passed is True

    fail_res = evaluate_single_rule(rule, "Antarctica")
    assert fail_res.passed is False


def test_evaluate_rule_required_operator() -> None:
    rule = RuleDefinition(
        rule_type=RuleType.COLLATERAL_REQUIRED,
        operator=RuleOperator.REQUIRED,
        severity=RuleSeverity.HARD_CONSTRAINT,
    )
    assert evaluate_single_rule(rule, True).passed is True
    assert evaluate_single_rule(rule, False).passed is False
    assert evaluate_single_rule(rule, None).passed is False
