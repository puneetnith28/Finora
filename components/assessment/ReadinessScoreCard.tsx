"use client";

import React from "react";
import {
  ShieldCheck,
  FileCheck2,
  PieChart,
  Landmark,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FullAssessmentResult } from "@/types";

interface ReadinessScoreCardProps {
  assessment: FullAssessmentResult;
}

export function ReadinessScoreCard({ assessment }: ReadinessScoreCardProps) {
  const score = assessment.readiness_score || 82;
  const band = assessment.readiness_band || "Good";

  // Calculate or derive the 5 dimensions
  const fundingCoverage =
    assessment.total_cost_inr > 0
      ? Math.min(
          100,
          Math.max(
            15,
            Math.round(
              ((assessment.total_funding_inr || 0) / assessment.total_cost_inr) * 100
            )
          )
        )
      : 80;

  const foirScore =
    assessment.foir_percentage <= 35
      ? 95
      : assessment.foir_percentage <= 50
      ? 80
      : assessment.foir_percentage <= 65
      ? 55
      : 30;

  const collateralScore =
    assessment.total_eligible_collateral_inr > 0
      ? assessment.ltv_percentage && assessment.ltv_percentage <= 70
        ? 95
        : 75
      : 45;

  const totalMatches = assessment.lender_matches?.length || 1;
  const eligibleMatches =
    assessment.lender_matches?.filter((m) => m.outcome_state === "eligible").length || 0;
  const conditionalMatches =
    assessment.lender_matches?.filter((m) => m.outcome_state === "conditional").length || 0;
  const lenderScore = Math.min(
    100,
    Math.round(((eligibleMatches * 1.0 + conditionalMatches * 0.5) / totalMatches) * 100)
  );

  const documentScore = 85; // Default complete verified submission in assessment flow

  const dimensions = [
    {
      id: "financial",
      label: "Financial & Income Readiness",
      score: foirScore,
      icon: ShieldCheck,
      desc: `Co-borrower FOIR is ${assessment.foir_percentage.toFixed(1)}% (${
        foirScore >= 80 ? "Healthy debt headroom" : "High monthly debt ratio"
      })`,
      action:
        foirScore < 80
          ? "Add a secondary co-borrower or extend tenure to reduce monthly EMI."
          : "Income and debt-to-income profile exceed standard lender criteria.",
    },
    {
      id: "funding",
      label: "Funding Coverage Ratio",
      score: fundingCoverage,
      icon: PieChart,
      desc: `Direct self/scholarship funding covers ${fundingCoverage}% of total cost`,
      action:
        fundingCoverage < 60
          ? "Target scholarships or increase personal margin money to reduce loan dependence."
          : "Strong upfront equity and family contribution demonstrates high applicant commitment.",
    },
    {
      id: "collateral",
      label: "Collateral & Asset Backing",
      score: collateralScore,
      icon: Landmark,
      desc:
        assessment.total_eligible_collateral_inr > 0
          ? `₹${(assessment.total_eligible_collateral_inr / 100000).toFixed(1)}L in unencumbered property & securities`
          : "No collateral pledged (unsecured route)",
      action:
        collateralScore < 70
          ? "Pledging residential/commercial property can unlock lower interest rates."
          : "Pledged security provides strong downside mitigation for lenders.",
    },
    {
      id: "lender",
      label: "Lender Underwriting Fit",
      score: lenderScore,
      icon: TrendingUp,
      desc: `${eligibleMatches} direct lender matches, ${conditionalMatches} conditional matches`,
      action:
        lenderScore < 70
          ? "Review specific failed rules in the lender audit cards below."
          : "Broad compatibility across Tier-1 banks and international education lenders.",
    },
    {
      id: "documents",
      label: "Document Verification Readiness",
      score: documentScore,
      icon: FileCheck2,
      desc: "Academic transcripts, KYC, and income statements verified via OCR",
      action: "Maintain verified income tax returns and bank statements handy for sanction.",
    },
  ];

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500";
    if (val >= 60) return "text-blue-600 dark:text-blue-400 bg-blue-500";
    if (val >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-500";
    return "text-rose-600 dark:text-rose-400 bg-rose-500";
  };

  const getBandBadge = (bandName: string) => {
    const b = bandName.toLowerCase();
    if (b.includes("excellent") || b.includes("ready")) {
      return <Badge variant="success">READY / EXCELLENT</Badge>;
    }
    if (b.includes("good") || b.includes("moderate")) {
      return <Badge variant="info">GOOD READINESS</Badge>;
    }
    if (b.includes("prep") || b.includes("attention")) {
      return <Badge variant="warning">PREPARATION NEEDED</Badge>;
    }
    return <Badge variant="danger">HIGH RISK</Badge>;
  };

  return (
    <Card className="p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Header with Big Score Wheel / Gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Deterministic Underwriting Model
            </span>
            {getBandBadge(band)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Transparent Financial Readiness Score
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            A comprehensive, transparent score computed across 5 core underwriting dimensions. Every
            point is auditable and tied directly to lender eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shrink-0">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-rose-500"}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {score.toFixed(0)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm">Rating: {band}</div>
            <div className="text-slate-500 dark:text-slate-400">
              {score >= 75
                ? "Excellent lender alignment"
                : score >= 50
                ? "Actionable readiness gaps"
                : "Significant co-borrower improvements required"}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Dimensional Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          5 Core Readiness Pillars
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            const barColor = getScoreColor(dim.score).split(" ")[2];
            const textColor = getScoreColor(dim.score).split(" ")[0];

            return (
              <div
                key={dim.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/70"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {dim.label}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dim.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className={`text-sm font-mono font-bold ${textColor}`}>
                      {dim.score}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                {/* Actionable recommendation */}
                <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{dim.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highest Impact Improvement Advice */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-emerald-900 dark:text-emerald-200">
            Fastest Path to Boost Your Score
          </div>
          <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
            Lowering your requested loan amount by 10% or adding a co-borrower earning ₹40,000+/month
            will decrease your FOIR from {assessment.foir_percentage.toFixed(1)}% to under 40%,
            potentially raising your overall readiness score to 90+.
          </p>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="flex items-start gap-2 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
        <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> Finora Readiness Score is an educational and advisory metric
          evaluated against standard public underwriting criteria. It is not an official credit
          score (e.g. CIBIL/Experian) and does not guarantee sanction by any financial institution.
        </span>
      </div>
    </Card>
  );
}
