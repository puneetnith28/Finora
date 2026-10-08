"""Unit tests for rule types and definitions."""

from decimal import Decimal

from app.services.rules.rule_types import (
    RuleDefinition,
    RuleOperator,
    RuleSeverity,
    RuleType,
)


def test_rule_definition_instantiation() -> None:
    rule = RuleDefinition(
        rule_type=RuleType.MAXIMUM_FOIR,
        operator=RuleOperator.LTE,
        expected_numeric=Decimal("0.65"),
        severity=RuleSeverity.HARD_CONSTRAINT,
        weight=Decimal("2.00"),
        description="Max allowable FOIR is 65%",
    )
    assert rule.rule_type == RuleType.MAXIMUM_FOIR
    assert rule.operator == RuleOperator.LTE
    assert rule.expected_numeric == Decimal("0.65")
    assert rule.severity == RuleSeverity.HARD_CONSTRAINT


def test_rule_definition_list_operator() -> None:
    rule = RuleDefinition(
        rule_type=RuleType.COUNTRY_ALLOWED,
        operator=RuleOperator.IN,
        expected_list=["USA", "UK", "Canada", "Germany"],
        severity=RuleSeverity.HARD_CONSTRAINT,
    )
    assert rule.operator == RuleOperator.IN
    assert "USA" in rule.expected_list
