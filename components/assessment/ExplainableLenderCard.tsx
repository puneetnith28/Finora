"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Percent,
  Sparkles,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LenderMatch } from "@/types";

interface ExplainableLenderCardProps {
  lender: LenderMatch;
  defaultExpanded?: boolean;
}

export function ExplainableLenderCard({
  lender,
  defaultExpanded = false,
}: ExplainableLenderCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isEligible = lender.outcome_state === "eligible";
  const isConditional = lender.outcome_state === "conditional";
  const isIneligible = lender.outcome_state === "ineligible";

  const formatCurrency = (val?: number | string | null) => {
    if (val === undefined || val === null) return "—";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = () => {
    if (isEligible) {
      return (
        <Badge variant="success" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Eligible
        </Badge>
      );
    }
    if (isConditional) {
      return (
        <Badge variant="warning" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Conditional Approval
        </Badge>
      );
    }
    if (isIneligible) {
      return (
        <Badge variant="danger" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Ineligible
        </Badge>
      );
    }
    return (
      <Badge variant="info" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
        Needs Review
      </Badge>
    );
  };

  // Derive remedial actions from failed criteria
  const failedCriteria = lender.evaluated_criteria?.filter((c) => !c.passed) || [];
  const remedialSuggestions = lender.remedial_suggestions || failedCriteria.map((fc) => {
    const name = fc.criterion_name.replace(/_/g, " ").toLowerCase();
    return `Review requirement for ${name}: Current value does not meet the lender's benchmark of ${fc.expected_value || "the required threshold"}.`;
  });

  return (
    <Card
      className={`border-l-4 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
        isEligible
          ? "border-l-emerald-600 bg-white dark:bg-slate-900"
          : isConditional
          ? "border-l-amber-500 bg-white dark:bg-slate-900"
          : isIneligible
          ? "border-l-rose-500 bg-white dark:bg-slate-900"
          : "border-l-blue-500 bg-white dark:bg-slate-900"
      }`}
    >
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div
            className={`p-3.5 rounded-2xl shrink-0 ${
              isEligible
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : isConditional
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            <Building2 className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lender.lender_name}
              </h3>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                {lender.lender_type?.replace(/_/g, " ") || "EDUCATION FINANCIER"}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Percent className="h-3 w-3" /> Match Score: {(lender.match_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Key Loan Terms */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0 flex-wrap">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Indicative Rate</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              {lender.interest_rate_min ? `${lender.interest_rate_min.toFixed(2)}%` : "9.50%"} -{" "}
              {lender.interest_rate_max ? `${lender.interest_rate_max.toFixed(2)}%` : "12.75%"}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Max Limit</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              {formatCurrency(lender.max_loan_amount_inr || 7500000)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-700 dark:text-slate-300"
            rightIcon={
              isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            }
          >
            {isExpanded ? "Hide Breakdown" : "View Audit"}
          </Button>
        </div>
      </div>

      {/* Primary Reason / Summary */}
      <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {lender.primary_reason ||
            (isEligible
              ? "All mandatory and primary credit underwriting rules satisfied."
              : isConditional
              ? "Eligible with condition: review collateral coverage and co-borrower obligations."
              : "Does not meet one or more mandatory eligibility thresholds.")}
        </p>
      </div>

      {/* Expandable Criteria Audit & Remedial Actions */}
      {isExpanded && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-6">
          {/* 1. Evaluated Criteria Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Rule-by-Rule Audit Matrix
              </h4>
              <span className="text-[11px] text-slate-500">
                {lender.evaluated_criteria?.filter((c) => c.passed).length || 0} /{" "}
                {lender.evaluated_criteria?.length || 0} Rules Passed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lender.evaluated_criteria && lender.evaluated_criteria.length > 0 ? (
                lender.evaluated_criteria.map((crit, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 transition-colors ${
                      crit.passed
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200"
                        : crit.required
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40 text-rose-900 dark:text-rose-200"
                        : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {crit.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : crit.required ? (
                          <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white capitalize">
                          {crit.criterion_name.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          crit.required
                            ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {crit.required ? "Mandatory" : "Optional"}
                      </span>
                    </div>

                    {/* Actual vs Benchmark */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-black/5 dark:border-white/5">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Candidate Value</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {crit.actual_value !== undefined && crit.actual_value !== null
                            ? String(crit.actual_value)
                            : "Not Provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Benchmark Required</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {crit.expected_value || "—"}
                        </span>
                      </div>
                    </div>

                    {crit.explanation && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        {crit.explanation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                  Detailed evaluation criteria available upon final underwriting sync.
                </div>
              )}
            </div>
          </div>

          {/* 2. Next Best Action / Remedial Action Suggestions */}
          {remedialSuggestions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span>Recommended Actions to Unlock Approval</span>
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-amber-900/90 dark:text-amber-200/90">
                {remedialSuggestions.map((rec, i) => (
                  <li key={i} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Demo Disclaimer Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>
              <strong>Demo Criteria Notice:</strong> Lender guidelines shown above are sample benchmark rules for platform verification and not binding bank commitments.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
