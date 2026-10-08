"""Generic deterministic rule evaluator for lender underwriting criteria."""

from decimal import Decimal, InvalidOperation
from typing import Any

from pydantic import BaseModel

from app.services.rules.rule_types import RuleDefinition, RuleOperator


class RuleEvaluationResult(BaseModel):
    rule_type: str
    operator: str
    passed: bool
    actual_value: str
    expected_value: str
    reason: str
    severity: str
    weight: Decimal
    description: str | None = None


def evaluate_single_rule(
    rule: RuleDefinition,
    actual_value: Any,
) -> RuleEvaluationResult:
    """Evaluate a single rule definition against a supplied actual candidate value."""
    op = rule.operator
    passed = False
    reason = ""

    # 1. Boolean handling
    if isinstance(actual_value, bool):
        actual_bool = actual_value
        expected_bool = (
            str(rule.expected_text).lower().strip() in ["true", "1", "yes"]
            if rule.expected_text is not None
            else (rule.expected_numeric == 1)
        )
        if op == RuleOperator.EQ:
            passed = actual_bool == expected_bool
        elif op == RuleOperator.NEQ:
            passed = actual_bool != expected_bool
        elif op == RuleOperator.REQUIRED:
            passed = actual_bool is True
        else:
            passed = False
        actual_str = str(actual_bool)
        expected_str = f"{op.value} {expected_bool}"
        reason = (
            f"Candidate meets requirement ({actual_bool})"
            if passed
            else f"Actual value is {actual_bool} (expected {expected_bool})"
        )

    # 2. Numeric / text comparisons (>=, <=, >, <, ==, !=)
    elif op in [
        RuleOperator.GTE,
        RuleOperator.LTE,
        RuleOperator.GT,
        RuleOperator.LT,
        RuleOperator.EQ,
        RuleOperator.NEQ,
    ]:
        if actual_value is None:
            passed = False
            reason = f"Actual value is missing for criterion {rule.rule_type.value}"
            actual_str = "None"
            expected_str = str(
                rule.expected_numeric if rule.expected_numeric is not None else rule.expected_text
            )
        else:
            try:
                actual_num = Decimal(str(actual_value))
                expected_num = rule.expected_numeric or Decimal(str(rule.expected_text or 0))

                if op == RuleOperator.GTE:
                    passed = actual_num >= expected_num
                    reason = (
                        f"Actual {actual_num} satisfies minimum {expected_num}"
                        if passed
                        else f"Actual {actual_num} is below minimum required {expected_num}"
                    )
                elif op == RuleOperator.LTE:
                    passed = actual_num <= expected_num
                    reason = (
                        f"Actual {actual_num} satisfies maximum limit {expected_num}"
                        if passed
                        else f"Actual {actual_num} exceeds allowable maximum {expected_num}"
                    )
                elif op == RuleOperator.GT:
                    passed = actual_num > expected_num
                    reason = (
                        f"Actual {actual_num} is strictly greater than {expected_num}"
                        if passed
                        else f"Actual {actual_num} is not greater than {expected_num}"
                    )
                elif op == RuleOperator.LT:
                    passed = actual_num < expected_num
                    reason = (
                        f"Actual {actual_num} is strictly less than {expected_num}"
                        if passed
                        else f"Actual {actual_num} is not less than {expected_num}"
                    )
                elif op == RuleOperator.EQ:
                    passed = actual_num == expected_num
                    reason = (
                        f"Actual {actual_num} matches {expected_num}"
                        if passed
                        else f"Actual {actual_num} does not match {expected_num}"
                    )
                elif op == RuleOperator.NEQ:
                    passed = actual_num != expected_num
                    reason = (
                        f"Actual {actual_num} differs from {expected_num}"
                        if passed
                        else f"Actual {actual_num} equals prohibited value {expected_num}"
                    )

                actual_str = str(actual_num)
                expected_str = f"{op.value} {expected_num}"
            except (ValueError, TypeError, InvalidOperation):
                # Fallback to string equality if not numeric
                actual_str = str(actual_value)
                expected_str = str(rule.expected_text or "")
                if op == RuleOperator.EQ:
                    passed = actual_str.lower().strip() == expected_str.lower().strip()
                elif op == RuleOperator.NEQ:
                    passed = actual_str.lower().strip() != expected_str.lower().strip()
                else:
                    passed = False
                reason = f"Evaluated textual equality for '{actual_str}' vs '{expected_str}'"

    # 2. IN / NOT_IN operator
    elif op in [RuleOperator.IN, RuleOperator.NOT_IN]:
        actual_str = str(actual_value or "").strip()
        allowed = [x.strip().lower() for x in rule.expected_list]
        if not allowed and rule.expected_text:
            allowed = [x.strip().lower() for x in rule.expected_text.split(",")]

        if op == RuleOperator.IN:
            passed = actual_str.lower() in allowed
            reason = (
                f"'{actual_str}' is in approved list [{', '.join(allowed)}]"
                if passed
                else f"'{actual_str}' is not in approved list [{', '.join(allowed)}]"
            )
            expected_str = f"in [{', '.join(allowed)}]"
        else:
            passed = actual_str.lower() not in allowed
            reason = (
                f"'{actual_str}' is not in excluded list"
                if passed
                else f"'{actual_str}' is in excluded list [{', '.join(allowed)}]"
            )
            expected_str = f"not in [{', '.join(allowed)}]"

    # 3. REQUIRED operator
    elif op == RuleOperator.REQUIRED:
        if isinstance(actual_value, bool):
            passed = actual_value is True
        elif actual_value is None:
            passed = False
        elif isinstance(actual_value, str):
            passed = len(actual_value.strip()) > 0
        elif isinstance(actual_value, (list, dict)):
            passed = len(actual_value) > 0
        else:
            passed = bool(actual_value)

        actual_str = str(actual_value)
        expected_str = "required (present / true)"
        reason = (
            "Required attribute is present and valid"
            if passed
            else "Missing mandatory required attribute"
        )

    else:
        actual_str = str(actual_value)
        expected_str = "supported operator"
        passed = False
        reason = f"Unknown rule operator: {op}"

    return RuleEvaluationResult(
        rule_type=rule.rule_type.value,
        operator=op.value,
        passed=passed,
        actual_value=actual_str,
        expected_value=expected_str,
        reason=reason,
        severity=rule.severity.value,
        weight=rule.weight,
        description=rule.description,
    )
