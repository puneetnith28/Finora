import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx and twMerge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with internationalization
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "INR",
  maximumFractionDigits = 0
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits,
    }).format(numericAmount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits,
  }).format(numericAmount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number | string | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "0.0%";
  }
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  return `${numericValue.toFixed(decimals)}%`;
}

/**
 * Format large numbers in compact Indian or Western notation (e.g. ₹45.5 Lakhs)
 */
export function formatCompactCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)} K`;
  }
  return `₹${val.toFixed(0)}`;
}

/**
 * Status color helper for readiness bands
 */
export function getReadinessColor(band: string | null | undefined): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (band?.toLowerCase()) {
    case "excellent":
    case "strong":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30",
        badge: "bg-emerald-600 text-white",
      };
    case "moderate":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
        badge: "bg-amber-600 text-white",
      };
    case "weak":
    case "critical":
    case "high_risk":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        badge: "bg-rose-600 text-white",
      };
    default:
      return {
        bg: "bg-slate-500/10 dark:bg-slate-500/20",
        text: "text-slate-700 dark:text-slate-400",
        border: "border-slate-500/30",
        badge: "bg-slate-600 text-white",
      };
  }
}

/**
 * Normalizes an assessment response (from raw backend FullAssessmentReport or stored DB records)
 * into a safe, consistent FullAssessmentResult domain object for UI components.
 */
export function normalizeAssessmentResult(raw: unknown): import("@/types").FullAssessmentResult {
  if (!raw || typeof raw !== "object") {
    return {
      id: 0,
      student_id: 0,
      readiness_score: 80,
      readiness_band: "Moderate",
      total_cost_inr: 0,
      total_funding_inr: 0,
      funding_gap_inr: 0,
      foir_percentage: 0,
      net_worth_inr: 0,
      total_eligible_collateral_inr: 0,
      ltv_percentage: 0,
      lender_matches: [],
      disclaimer: "Indicative assessment based on provided data.",
    };
  }

  const rawObj = raw as Record<string, unknown>;
  const finSummary = (rawObj.financial_summary as Record<string, unknown>) || {};
  const studyCost = (finSummary.study_cost as Record<string, unknown>) || {};
  const funding = (finSummary.funding as Record<string, unknown>) || {};
  const fundingGap = (finSummary.funding_gap as Record<string, unknown>) || {};
  const netWorth = (finSummary.net_worth as Record<string, unknown>) || {};
  const collateral = (finSummary.collateral as Record<string, unknown>) || {};
  const foir = (finSummary.foir as Record<string, unknown>) || {};
  const ltv = (finSummary.ltv as Record<string, unknown>) || {};

  const totalCost = Number(
    studyCost.total_cost_inr ?? rawObj.total_cost_inr ?? rawObj.total_study_cost ?? 0
  );
  const totalFunding = Number(
    funding.total_funding_inr ?? rawObj.total_funding_inr ?? rawObj.available_funding ?? 0
  );
  const rawGap = Number(
    fundingGap.funding_gap_inr ??
      rawObj.funding_gap_inr ??
      rawObj.funding_gap ??
      totalCost - totalFunding
  );
  const gap = Math.max(0, rawGap);
  const netWorthVal = Number(
    netWorth.net_worth_inr ?? rawObj.net_worth_inr ?? rawObj.net_worth ?? 0
  );
  const eligibleCollateral = Number(
    collateral.total_eligible_collateral_inr ?? rawObj.total_eligible_collateral_inr ?? 0
  );

  let foirPct = 0;
  if (foir.foir_percentage != null) {
    foirPct = Number(foir.foir_percentage);
  } else if (foir.foir_ratio != null) {
    foirPct = Number(foir.foir_ratio) * 100;
  } else if (rawObj.foir_percentage != null) {
    foirPct = Number(rawObj.foir_percentage);
  } else if (rawObj.foir != null) {
    foirPct = Number(rawObj.foir) * 100;
  }

  let ltvPct: number | null = null;
  if (ltv.ltv_percentage != null) {
    ltvPct = Number(ltv.ltv_percentage);
  } else if (ltv.ltv_ratio != null) {
    ltvPct = Number(ltv.ltv_ratio) * 100;
  } else if (rawObj.ltv_percentage != null) {
    ltvPct = Number(rawObj.ltv_percentage);
  } else if (rawObj.ltv != null) {
    ltvPct = Number(rawObj.ltv) * 100;
  }

  const score = Number(finSummary.readiness_score ?? rawObj.readiness_score ?? 82);
  const band = String(
    finSummary.readiness_band ||
      rawObj.readiness_band ||
      (score >= 80
        ? "Excellent"
        : score >= 65
          ? "Strong"
          : score >= 45
            ? "Moderate"
            : "Needs Review")
  );

  const rawMatches = Array.isArray(rawObj.lender_matches)
    ? (rawObj.lender_matches as Record<string, unknown>[])
    : Array.isArray(rawObj.lender_evaluations)
      ? (rawObj.lender_evaluations as Record<string, unknown>[])
      : Array.isArray(rawObj.rule_results)
        ? (rawObj.rule_results as Record<string, unknown>[])
        : [];

  const lender_matches: import("@/types").LenderMatch[] = rawMatches.map(
    (m: Record<string, unknown>, idx: number) => {
      let outcome: "eligible" | "conditional" | "ineligible" = "conditional";
      const rawOutcome = String(m.outcome_state || "").toLowerCase();
      if (rawOutcome === "eligible" || rawOutcome === "potential_match" || rawOutcome === "match") {
        outcome = "eligible";
      } else if (
        rawOutcome === "ineligible" ||
        rawOutcome === "not_a_match" ||
        rawOutcome === "rejected"
      ) {
        outcome = "ineligible";
      } else {
        outcome = "conditional";
      }

      const ruleResults = Array.isArray(m.rule_results)
        ? (m.rule_results as Record<string, unknown>[])
        : [];
      const passedRules = ruleResults.filter((r: Record<string, unknown>) => Boolean(r.passed));
      const failedRules = ruleResults.filter((r: Record<string, unknown>) => !r.passed);

      const rulesEvaluated = Number(
        m.rules_evaluated ??
          (ruleResults.length > 0
            ? ruleResults.length
            : (Number(m.passed_rules_count) || 0) + (Number(m.failed_rules_count) || 0))
      );
      const rulesPassed = Number(m.rules_passed ?? m.passed_rules_count ?? passedRules.length);
      const rulesFailed = Number(m.rules_failed ?? m.failed_rules_count ?? failedRules.length);

      let evaluatedCriteria = m.evaluated_criteria as
        import("@/types").EvaluatedCriterion[] | undefined;
      if (!evaluatedCriteria && ruleResults.length > 0) {
        evaluatedCriteria = ruleResults.map((r: Record<string, unknown>) => ({
          criterion_name: String(r.rule_name || r.rule_type || "Underwriting Rule"),
          passed: Boolean(r.passed),
          required: r.severity === "hard_constraint" || r.required !== false,
          expected_value: String(r.expected_value || "Eligible threshold"),
          actual_value: String(r.actual_value || "Evaluated"),
          explanation: String(
            r.reason || (r.passed ? "Meets lender criteria" : "Does not meet guideline")
          ),
        }));
      }

      const summaryReasons = Array.isArray(m.summary_reasons)
        ? (m.summary_reasons as string[])
        : [];

      return {
        lender_id: Number(m.lender_id ?? idx + 1),
        lender_name: String(m.lender_name ?? `Lender #${idx + 1}`),
        lender_type: String(m.lender_type ?? "Education Loan Specialist"),
        outcome_state: outcome,
        match_score: Number(
          m.match_score ?? (outcome === "eligible" ? 95 : outcome === "conditional" ? 75 : 30)
        ),
        interest_rate_min: m.interest_rate_min != null ? Number(m.interest_rate_min) : undefined,
        interest_rate_max: m.interest_rate_max != null ? Number(m.interest_rate_max) : undefined,
        max_loan_amount_inr:
          m.max_loan_amount_inr != null ? Number(m.max_loan_amount_inr) : undefined,
        rules_evaluated: rulesEvaluated,
        rules_passed: rulesPassed,
        rules_failed: rulesFailed,
        evaluated_criteria: evaluatedCriteria,
        failed_rules: Array.isArray(m.failed_rules)
          ? (m.failed_rules as import("@/types").FailedRuleAudit[])
          : undefined,
        passed_rules: Array.isArray(m.passed_rules)
          ? (m.passed_rules as import("@/types").PassedRuleAudit[])
          : undefined,
        conditions: Array.isArray(m.conditions) ? (m.conditions as string[]) : summaryReasons,
        remedial_actions: Array.isArray(m.remedial_actions)
          ? (m.remedial_actions as string[])
          : summaryReasons,
        primary_reason:
          (m.primary_reason as string) ||
          (summaryReasons.length > 0 ? summaryReasons[0] : undefined),
      };
    }
  );

  return {
    id: Number(rawObj.id ?? rawObj.assessment_id ?? 1),
    student_id: Number(rawObj.student_id ?? 1),
    readiness_score: score,
    readiness_band: band,
    total_cost_inr: totalCost,
    total_funding_inr: totalFunding,
    funding_gap_inr: gap,
    foir_percentage: foirPct,
    net_worth_inr: netWorthVal,
    total_eligible_collateral_inr: eligibleCollateral,
    ltv_percentage: ltvPct,
    lender_matches,
    disclaimer: String(
      rawObj.disclaimer ||
        "Indicative assessment based on provided data. Not a guaranteed sanction or formal loan offer."
    ),
    created_at: rawObj.created_at ? String(rawObj.created_at) : undefined,
  };
}
