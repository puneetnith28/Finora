"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Percent,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
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
        <span className="inline-block bg-[#86EFAC] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
          ✓ Direct Approval
        </span>
      );
    }
    if (isConditional) {
      return (
        <span className="inline-block bg-[#FEF08A] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
          ⚠ Conditional Approval
        </span>
      );
    }
    if (isIneligible) {
      return (
        <span className="inline-block bg-[#FECDD3] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
          ✕ Ineligible
        </span>
      );
    }
    return (
      <span className="inline-block bg-[#BAE6FD] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
        ⚡ Needs Review
      </span>
    );
  };

  // Derive remedial actions from failed criteria
  const failedCriteria = lender.evaluated_criteria?.filter((c) => !c.passed) || [];
  const remedialSuggestions = lender.remedial_suggestions || failedCriteria.map((fc) => {
    const name = fc.criterion_name.replace(/_/g, " ").toLowerCase();
    return `Review requirement for ${name}: Current value does not meet the lender's benchmark of ${fc.expected_value || "the required threshold"}.`;
  });

  return (
    <div
      className={`border-3 border-black p-5 sm:p-6 transition-all duration-150 ${
        isEligible
          ? "bg-white shadow-[6px_6px_0px_#86EFAC]"
          : isConditional
          ? "bg-white shadow-[6px_6px_0px_#FEF08A]"
          : isIneligible
          ? "bg-white shadow-[6px_6px_0px_#FECDD3]"
          : "bg-white shadow-[6px_6px_0px_#BAE6FD]"
      }`}
    >
      {/* Top Bar / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b-2 border-black">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_#000000] ${
              isEligible
                ? "bg-[#86EFAC]"
                : isConditional
                ? "bg-[#FEF08A]"
                : isIneligible
                ? "bg-[#FECDD3]"
                : "bg-[#BAE6FD]"
            }`}
          >
            <Building2 className="w-6 h-6 text-black stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                {lender.lender_name}
              </h3>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-black/70 bg-[#F3F4F6] px-2 py-0.5 border border-black">
                {lender.lender_type?.replace(/_/g, " ") || "EDUCATION FINANCIER"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-black bg-white px-2 py-0.5 border border-black">
                <Percent className="h-3 w-3 stroke-[3]" /> Match: {(lender.match_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Indicative Terms Pill Boxes */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          <div className="bg-[#FFFDF9] border-2 border-black px-3.5 py-2 shadow-[2px_2px_0px_#000000]">
            <span className="text-black/60 block text-[10px] font-black uppercase tracking-wider">Rate</span>
            <span className="font-mono font-black text-black text-sm">
              {lender.interest_rate_min ? `${lender.interest_rate_min.toFixed(2)}%` : "9.50%"} -{" "}
              {lender.interest_rate_max ? `${lender.interest_rate_max.toFixed(2)}%` : "12.75%"}
            </span>
          </div>

          <div className="bg-[#FFFDF9] border-2 border-black px-3.5 py-2 shadow-[2px_2px_0px_#000000]">
            <span className="text-black/60 block text-[10px] font-black uppercase tracking-wider">Max Cap</span>
            <span className="font-mono font-black text-black text-sm">
              {formatCurrency(lender.max_loan_amount_inr || 7500000)}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="neo-btn bg-[#F3F4F6] text-black text-xs font-black uppercase py-2 px-3 flex items-center gap-1.5"
          >
            {isExpanded ? (
              <>Hide Audit <ChevronUp className="w-4 h-4 stroke-[3]" /></>
            ) : (
              <>View Audit ({lender.evaluated_criteria?.length || 0}) <ChevronDown className="w-4 h-4 stroke-[3]" /></>
            )}
          </button>
        </div>
      </div>

      {/* Primary Reason / Summary */}
      <div className="mt-4 p-3 bg-[#FFFDF9] border-2 border-black flex items-start gap-2.5">
        <Info className="h-4 w-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
        <p className="text-xs sm:text-sm font-bold text-black leading-relaxed">
          {lender.primary_reason ||
            (isEligible
              ? "All mandatory and primary credit underwriting rules satisfied."
              : isConditional
              ? "Eligible with condition: review collateral coverage and co-borrower obligations."
              : "Does not meet one or more mandatory eligibility thresholds.")}
        </p>
      </div>

      {/* Expandable Rule Audit Matrix */}
      {isExpanded && (
        <div className="mt-6 pt-5 border-t-2 border-black space-y-6">
          {/* Rule Breakdown Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-black inline-block"></span>
              Deterministic Underwriting Matrix
            </h4>
            <span className="text-xs font-mono font-bold bg-[#FEF08A] px-2 py-0.5 border border-black">
              {lender.evaluated_criteria?.filter((c) => c.passed).length || 0} /{" "}
              {lender.evaluated_criteria?.length || 0} Criteria Met
            </span>
          </div>

          {/* Grid of Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lender.evaluated_criteria && lender.evaluated_criteria.length > 0 ? (
              lender.evaluated_criteria.map((crit, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 border-2 border-black text-xs flex flex-col justify-between gap-2.5 shadow-[2px_2px_0px_#000000] ${
                    crit.passed
                      ? "bg-[#F0FDF4]"
                      : crit.required
                      ? "bg-[#FFF1F2]"
                      : "bg-[#FEFCE8]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {crit.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 stroke-[3]" />
                      ) : crit.required ? (
                        <XCircle className="h-4 w-4 text-[#E11D48] shrink-0 stroke-[3]" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 stroke-[3]" />
                      )}
                      <span className="font-black uppercase tracking-tight text-black">
                        {crit.criterion_name.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 border border-black uppercase ${
                        crit.required
                          ? "bg-[#FECDD3] text-black"
                          : "bg-[#E5E7EB] text-black"
                      }`}
                    >
                      {crit.required ? "Mandatory" : "Optional"}
                    </span>
                  </div>

                  {/* Actual vs Required Benchmark */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-black/20">
                    <div>
                      <span className="text-black/60 block text-[9px] font-bold uppercase tracking-wider">Candidate</span>
                      <span className="font-mono font-bold text-black">
                        {crit.actual_value !== undefined && crit.actual_value !== null
                          ? String(crit.actual_value)
                          : "Not Provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-black/60 block text-[9px] font-bold uppercase tracking-wider">Benchmark</span>
                      <span className="font-mono font-bold text-black">
                        {crit.expected_value || "—"}
                      </span>
                    </div>
                  </div>

                  {crit.explanation && (
                    <p className="text-[11px] font-medium text-black/80 border-t border-black/10 pt-1.5">
                      {crit.explanation}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-4 text-xs font-bold text-black/60">
                Detailed rule evaluation criteria available upon final underwriting sync.
              </div>
            )}
          </div>

          {/* Remedial Suggestions Banner */}
          {remedialSuggestions.length > 0 && (
            <div className="p-4 bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_#000000] text-xs space-y-2">
              <div className="flex items-center gap-2 font-black uppercase text-black tracking-wide">
                <Sparkles className="h-4 w-4 stroke-[2.5]" />
                <span>Recommended Action Plan for Approval</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc font-bold text-black">
                {remedialSuggestions.map((rec, i) => (
                  <li key={i} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Notice */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-black bg-[#BAE6FD] p-2.5 border-2 border-black">
            <span className="font-mono font-black">ℹ AUDIT:</span>
            <span>
              Lender guidelines evaluated deterministically against current published underwriting thresholds.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
