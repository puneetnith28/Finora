"use client";

import React, { useState } from "react";
import { Download, RotateCcw, ShieldCheck } from "lucide-react";
import { formatCurrency, formatPercent, normalizeAssessmentResult } from "@/lib/utils";
import { ExplainableLenderCard } from "@/components/assessment/ExplainableLenderCard";
import { ReadinessScoreCard } from "@/components/assessment/ReadinessScoreCard";
import { FinancialVisuals } from "@/components/assessment/FinancialVisuals";
import { LenderMatch, FullAssessmentResult } from "@/types";

export interface AssessmentResultsProps {
  assessment: FullAssessmentResult;
  onReset: () => void;
}

export function AssessmentResults({ assessment: rawAssessment, onReset }: AssessmentResultsProps) {
  const assessment = normalizeAssessmentResult(rawAssessment);
  const [filter, setFilter] = useState<"all" | "eligible" | "conditional" | "ineligible">("all");

  const matches = Array.isArray(assessment?.lender_matches) ? assessment.lender_matches : [];

  const filteredMatches = matches.filter((m) => {
    if (filter === "all") return true;
    return m.outcome_state === filter;
  });

  const eligibleCount = matches.filter((m) => m.outcome_state === "eligible").length;
  const conditionalCount = matches.filter((m) => m.outcome_state === "conditional").length;
  const ineligibleCount = matches.filter((m) => m.outcome_state === "ineligible").length;

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Score Dossier Hero Card (Pitch Black + Yellow Accent Box) */}
      <div className="neo-box-black p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-block bg-[#FEF08A] text-black border-2 border-white px-3 py-1 text-xs font-black uppercase tracking-wider -rotate-1 shadow-[2px_2px_0px_#FFFFFF]">
              AUDIT COMPLETED • DETERMINISTIC RECORD
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
              READINESS SCORE: {assessment.readiness_score?.toFixed(0) || 85}/100
            </h1>

            <p className="text-sm sm:text-base font-medium text-white/90 max-w-2xl leading-relaxed">
              Based on your target university, study budget of{" "}
              <strong className="text-[#FEF08A] font-mono font-black">
                {formatCurrency(assessment.total_cost_inr)}
              </strong>
              , co-borrower FOIR of{" "}
              <strong className="text-[#FEF08A] font-mono font-black">
                {formatPercent(assessment.foir_percentage)}
              </strong>
              , and collateral LTV, your application qualifies for{" "}
              <strong className="text-[#86EFAC] font-black">
                {eligibleCount} direct lender approvals
              </strong>{" "}
              and{" "}
              <strong className="text-[#FEF08A] font-black">
                {conditionalCount} conditional options
              </strong>
              .
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                onClick={() => window.print()}
                className="neo-btn bg-[#FEF08A] text-black text-xs font-black uppercase py-2.5 px-4 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 stroke-[2.5]" />
                Print Dossier PDF
              </button>
              <button
                onClick={onReset}
                className="neo-btn bg-white text-black text-xs font-black uppercase py-2.5 px-4 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                Start New Assessment
              </button>
            </div>
          </div>

          {/* Right Stamp Card */}
          <div className="lg:col-span-4 bg-[#FFFDF9] border-3 border-white p-6 text-black text-center space-y-2 shadow-[4px_4px_0px_#FEF08A]">
            <span className="text-[11px] font-black uppercase tracking-widest text-black/60 block">
              Readiness Band
            </span>
            <div className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
              {assessment.readiness_band}
            </div>
            <div className="pt-2 border-t-2 border-black text-xs font-bold">
              {eligibleCount > 0 ? (
                <span className="text-[#16A34A] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 stroke-[3]" /> High Sanction Probability
                </span>
              ) : (
                <span className="text-[#D97706]">Conditional Path Available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Underwriting Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neo-box p-4 bg-[#FFFDF9]">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
            Total Budget
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            {formatCurrency(assessment.total_cost_inr)}
          </div>
          <span className="text-[11px] font-bold text-black/70 mt-1 block">
            Tuition + Living + Buffer
          </span>
        </div>

        <div className="neo-box p-4 bg-[#FEF08A]">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
            Funding Gap
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            {formatCurrency(assessment.funding_gap_inr)}
          </div>
          <span className="text-[11px] font-black uppercase text-black mt-1 inline-block bg-black text-white px-1.5 py-0.5">
            Loan Required
          </span>
        </div>

        <div className="neo-box p-4 bg-[#FFFDF9]">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
            Co-Borrower FOIR
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            {formatPercent(assessment.foir_percentage)}
          </div>
          <span
            className={`text-[10px] font-black uppercase px-1.5 py-0.5 mt-1 inline-block border border-black ${
              assessment.foir_percentage <= 50 ? "bg-[#86EFAC]" : "bg-[#FEF08A]"
            }`}
          >
            {assessment.foir_percentage <= 50 ? "✓ Safe FOIR (≤50%)" : "⚠ Elevated FOIR"}
          </span>
        </div>

        <div className="neo-box p-4 bg-[#BAE6FD]">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
            Eligible Collateral
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            {formatCurrency(assessment.total_eligible_collateral_inr)}
          </div>
          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 mt-1 inline-block border border-black bg-white">
            {assessment.total_eligible_collateral_inr > 0
              ? "Secured Asset Base"
              : "Unsecured Evaluation"}
          </span>
        </div>
      </div>

      {/* 2b. Transparent Multi-Dimensional Readiness Score Indicator */}
      <ReadinessScoreCard
        assessment={assessment as unknown as import("@/types").FullAssessmentResult}
      />

      {/* 2c. Interactive Financial Breakdown Charts */}
      <FinancialVisuals
        totalCostInr={assessment.total_cost_inr}
        totalFundingInr={assessment.total_funding_inr}
        fundingGapInr={assessment.funding_gap_inr}
        netWorthInr={assessment.net_worth_inr}
        totalEligibleCollateralInr={assessment.total_eligible_collateral_inr}
      />

      {/* 3. Lender Matching Results & Audit Trail */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4">
          <div>
            <div className="inline-block bg-[#86EFAC] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1">
              RULE-BASED MATCH ENGINE
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              Lender Eligibility Dossier
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              100% transparent audit of all passed and failed underwriting criteria per lender.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                filter === "all"
                  ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              All ({matches.length})
            </button>
            <button
              onClick={() => setFilter("eligible")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                filter === "eligible"
                  ? "bg-[#86EFAC] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              Approved ({eligibleCount})
            </button>
            <button
              onClick={() => setFilter("conditional")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                filter === "conditional"
                  ? "bg-[#FEF08A] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              Conditional ({conditionalCount})
            </button>
            <button
              onClick={() => setFilter("ineligible")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                filter === "ineligible"
                  ? "bg-[#FECDD3] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
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
                lender.match_score ??
                ((lender.rules_evaluated || 0) > 0
                  ? (lender.rules_passed || 0) / (lender.rules_evaluated || 1)
                  : lender.outcome_state === "eligible"
                    ? 1.0
                    : lender.outcome_state === "conditional"
                      ? 0.75
                      : 0.3),
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
                  explanation:
                    r.reason || "Does not satisfy required lender underwriting guideline.",
                })),
              ],
            };

            return <ExplainableLenderCard key={lender.lender_id} lender={normalizedLender} />;
          })}
        </div>
      </div>

      {/* 4. Legal & Regulatory Disclaimer */}
      <div className="p-4 bg-[#FFFDF9] border-2 border-black text-xs font-bold text-black/80 leading-relaxed shadow-[3px_3px_0px_#000000]">
        <div className="font-black uppercase tracking-wider text-[11px] text-black mb-1">
          Regulatory & Underwriting Disclaimer
        </div>
        {assessment.disclaimer ||
          "This evaluation is generated by Finora's deterministic rule engine using bank-published underwriting guidelines. It provides an indicative readiness audit and does not constitute a formal sanction letter."}
      </div>
    </div>
  );
}
