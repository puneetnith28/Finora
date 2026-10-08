"use client";

import React, { useState } from "react";
import { 
  Download, 
  RotateCcw, 
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ExplainableLenderCard } from "@/components/assessment/ExplainableLenderCard";
import { LenderMatch } from "@/types";

export interface LenderMatchResult {
  lender_id: number;
  lender_name: string;
  lender_type: string;
  outcome_state: "eligible" | "conditional" | "ineligible" | "review_required";
  interest_rate_min: number;
  interest_rate_max: number;
  max_loan_amount_inr: number;
  rules_evaluated: number;
  rules_passed: number;
  rules_failed: number;
  failed_rules: Array<{
    rule_id?: string;
    rule_name?: string;
    rule_type?: string;
    reason?: string;
    field?: string;
    threshold?: unknown;
    actual_value?: unknown;
  }>;
  passed_rules: Array<{
    rule_id?: string;
    rule_name?: string;
    rule_type?: string;
  }>;
  conditions?: string[];
  remedial_actions?: string[];
}

export interface FullAssessmentResult {
  id: number;
  student_id: number;
  readiness_score: number;
  readiness_band: string;
  total_cost_inr: number;
  total_funding_inr: number;
  funding_gap_inr: number;
  foir_percentage: number;
  net_worth_inr: number;
  total_eligible_collateral_inr: number;
  ltv_percentage?: number | null;
  lender_matches: LenderMatchResult[];
  disclaimer: string;
  created_at?: string;
}

export interface AssessmentResultsProps {
  assessment: FullAssessmentResult;
  onReset: () => void;
}

export function AssessmentResults({ assessment, onReset }: AssessmentResultsProps) {
  const [filter, setFilter] = useState<"all" | "eligible" | "conditional" | "ineligible">("all");

  const filteredMatches = assessment.lender_matches.filter((m) => {
    if (filter === "all") return true;
    return m.outcome_state === filter;
  });

  const eligibleCount = assessment.lender_matches.filter(
    (m) => m.outcome_state === "eligible"
  ).length;
  const conditionalCount = assessment.lender_matches.filter(
    (m) => m.outcome_state === "conditional"
  ).length;
  const ineligibleCount = assessment.lender_matches.filter(
    (m) => m.outcome_state === "ineligible"
  ).length;

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header & Score Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0f382c] dark:bg-emerald-950 p-6 sm:p-10 text-white shadow-2xl border border-emerald-800/80">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assessment Audit Completed</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Financial Readiness Score: {assessment.readiness_score?.toFixed(0) || 85}/100
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
              Based on your target university, normalized budget of{" "}
              <strong className="text-white font-mono">{formatCurrency(assessment.total_cost_inr)}</strong>, 
              co-borrower FOIR of{" "}
              <strong className="text-white font-mono">{formatPercent(assessment.foir_percentage)}</strong>, 
              and collateral LTV, your application qualifies for{" "}
              <strong className="text-emerald-300">{eligibleCount} direct lender approvals</strong> and{" "}
              <strong className="text-amber-300">{conditionalCount} conditional options</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Print / Save Audit PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="bg-emerald-900/40 text-emerald-100 border-emerald-700/60 hover:bg-emerald-800/40"
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Start New Assessment
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Readiness Rating
            </span>
            <div className="text-3xl font-extrabold capitalize text-white font-mono">
              {assessment.readiness_band}
            </div>
            <span className="text-xs text-emerald-200/80">
              {eligibleCount > 0 ? "High probability of loan sanction" : "Conditional approval path available"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Underwriting Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Study Budget"
          value={formatCurrency(assessment.total_cost_inr)}
          subtext="Tuition + Living + Buffer"
        />
        <StatCard
          label="Loan Funding Gap"
          value={formatCurrency(assessment.funding_gap_inr)}
          subtext="Net borrowing needed"
          badge={{ text: "Required Loan", variant: "primary" }}
        />
        <StatCard
          label="Co-Borrower FOIR"
          value={formatPercent(assessment.foir_percentage)}
          subtext="Debt-to-Income Ratio"
          badge={{
            text: assessment.foir_percentage <= 50 ? "Safe FOIR" : "Review FOIR",
            variant: assessment.foir_percentage <= 50 ? "success" : "warning",
          }}
        />
        <StatCard
          label="Eligible Collateral"
          value={formatCurrency(assessment.total_eligible_collateral_inr)}
          subtext="Post-haircut security value"
          badge={{
            text: assessment.total_eligible_collateral_inr > 0 ? "Secured" : "Unsecured",
            variant: assessment.total_eligible_collateral_inr > 0 ? "success" : "default",
          }}
        />
      </div>

      {/* 3. Lender Matching Results & Audit Trail */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Deterministic Lender Evaluations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              100% transparent audit of all passed and failed underwriting criteria per lender.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              All ({assessment.lender_matches.length})
            </button>
            <button
              onClick={() => setFilter("eligible")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "eligible"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Eligible ({eligibleCount})
            </button>
            <button
              onClick={() => setFilter("conditional")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "conditional"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Conditional ({conditionalCount})
            </button>
            <button
              onClick={() => setFilter("ineligible")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "ineligible"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Ineligible ({ineligibleCount})
            </button>
          </div>
        </div>

        {/* Lender Match Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredMatches.map((lender) => {
            const normalizedLender: LenderMatch = {
              lender_id: lender.lender_id,
              lender_name: lender.lender_name,
              lender_type: lender.lender_type,
              outcome_state: lender.outcome_state,
              match_score:
                lender.rules_evaluated > 0
                  ? lender.rules_passed / lender.rules_evaluated
                  : lender.outcome_state === "eligible"
                  ? 1.0
                  : lender.outcome_state === "conditional"
                  ? 0.75
                  : 0.3,
              interest_rate_min: lender.interest_rate_min,
              interest_rate_max: lender.interest_rate_max,
              max_loan_amount_inr: lender.max_loan_amount_inr,
              rules_evaluated: lender.rules_evaluated,
              rules_passed: lender.rules_passed,
              rules_failed: lender.rules_failed,
              failed_rules: lender.failed_rules,
              passed_rules: lender.passed_rules,
              conditions: lender.conditions,
              remedial_suggestions: lender.remedial_actions,
              evaluated_criteria: [
                ...(lender.passed_rules || []).map((r) => ({
                  criterion_name: r.rule_name || r.rule_id || "Rule Check",
                  passed: true,
                  required: true,
                  expected_value: "Eligible Threshold",
                  actual_value: "Meets Requirement",
                  explanation: "Candidate profile satisfies this underwriting criterion.",
                })),
                ...(lender.failed_rules || []).map((r) => ({
                  criterion_name: r.rule_name || r.rule_id || "Rule Check",
                  passed: false,
                  required: true,
                  expected_value: r.threshold ? String(r.threshold) : "Standard Criteria",
                  actual_value: r.actual_value ? String(r.actual_value) : "Current Value",
                  explanation: r.reason || "Does not satisfy required lender underwriting guideline.",
                })),
              ],
            };

            return (
              <ExplainableLenderCard
                key={lender.lender_id}
                lender={normalizedLender}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Legal & Engine Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
          Regulatory & Underwriting Disclaimer
        </div>
        {assessment.disclaimer ||
          "This evaluation is generated by Finora's deterministic rule engine using bank-published underwriting guidelines. It provides an indicative readiness audit and does not constitute a formal sanction letter."}
      </div>
    </div>
  );
}
