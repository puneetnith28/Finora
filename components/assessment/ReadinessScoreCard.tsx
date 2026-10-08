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
  Info
} from "lucide-react";
import { NeoBadge } from "@/components/ui/NeoPrimitives";
import { FullAssessmentResult } from "@/types";

interface ReadinessScoreCardProps {
  assessment: FullAssessmentResult;
}

export function ReadinessScoreCard({ assessment }: ReadinessScoreCardProps) {
  const score = assessment.readiness_score || 82;
  const band = assessment.readiness_band || "Good";

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

  const documentScore = 85;

  const dimensions = [
    {
      id: "financial",
      label: "01 / FINANCIAL & INCOME HEADROOM",
      score: foirScore,
      icon: ShieldCheck,
      desc: `FOIR is ${assessment.foir_percentage.toFixed(1)}% (${
        foirScore >= 80 ? "Healthy capacity" : "High debt ratio"
      })`,
      action:
        foirScore < 80
          ? "Add a secondary co-borrower or extend tenure to reduce monthly EMI."
          : "Income and debt-to-income profile exceed standard lender criteria.",
    },
    {
      id: "funding",
      label: "02 / FUNDING COVERAGE RATIO",
      score: fundingCoverage,
      icon: PieChart,
      desc: `Self/scholarship funding covers ${fundingCoverage}% of total cost`,
      action:
        fundingCoverage < 60
          ? "Target scholarships or increase personal margin money to reduce loan dependence."
          : "Strong upfront equity demonstrates high commitment.",
    },
    {
      id: "collateral",
      label: "03 / COLLATERAL & ASSET BACKING",
      score: collateralScore,
      icon: Landmark,
      desc:
        assessment.total_eligible_collateral_inr > 0
          ? `₹${(assessment.total_eligible_collateral_inr / 100000).toFixed(1)}L in unencumbered property & securities`
          : "No collateral pledged (unsecured route)",
      action:
        collateralScore < 70
          ? "Pledging property can unlock lower interest rates."
          : "Pledged security provides strong downside mitigation.",
    },
    {
      id: "lender",
      label: "04 / LENDER UNDERWRITING FIT",
      score: lenderScore,
      icon: TrendingUp,
      desc: `${eligibleMatches} direct lender matches, ${conditionalMatches} conditional matches`,
      action:
        lenderScore < 70
          ? "Review specific failed rules in the lender audit cards below."
          : "Broad compatibility across Tier-1 banks and international lenders.",
    },
    {
      id: "documents",
      label: "05 / DOCUMENT VERIFICATION READINESS",
      score: documentScore,
      icon: FileCheck2,
      desc: "Academic transcripts, KYC, and income statements verified via OCR",
      action: "Maintain verified income tax returns and bank statements handy.",
    },
  ];

  return (
    <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-8">
      {/* Top Header with Big Score Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-black">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <NeoBadge variant="pink" rotate="left">
              DETERMINISTIC UNDERWRITING SCORE
            </NeoBadge>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            FINANCIAL READINESS SCORECARD
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-800 max-w-xl leading-relaxed">
            A transparent score computed across 5 core underwriting dimensions. Every point is auditable and tied directly to lender eligibility rules.
          </p>
        </div>

        {/* Score Box */}
        <div className="neo-box-black p-5 flex items-center gap-4 shrink-0 shadow-[5px_5px_0px_0px_#FEF08A]">
          <div className="text-center border-r-2 border-white pr-4">
            <span className="text-4xl font-black font-mono text-[#FEF08A] block">
              {score.toFixed(0)}
            </span>
            <span className="text-[10px] font-black text-white uppercase block">
              OUT OF 100
            </span>
          </div>
          <div className="space-y-1">
            <NeoBadge variant="yellow">{band.toUpperCase()}</NeoBadge>
            <span className="text-[10px] font-bold text-neutral-300 block pt-0.5">
              {score >= 75 ? "Prime lender fit" : "Conditional alignment"}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Dimensional Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          5 CORE READINESS PILLARS
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {dimensions.map((dim) => (
            <div
              key={dim.id}
              className="neo-box p-4 bg-[#FAF8F5] space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-black uppercase text-black">
                    {dim.label}
                  </span>
                  <p className="text-[11px] font-bold text-neutral-600">{dim.desc}</p>
                </div>
                <span className="text-sm font-mono font-black text-black">
                  {dim.score}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 border-2 border-black bg-white overflow-hidden">
                <div
                  className={`h-full border-r-2 border-black ${
                    dim.score >= 80 ? "bg-[#86EFAC]" : dim.score >= 55 ? "bg-[#FEF08A]" : "bg-[#F472B6]"
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <div className="flex items-start gap-1 text-[11px] font-bold text-neutral-800 pt-0.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
                <span>{dim.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Advice */}
      <div className="neo-box-yellow p-4 space-y-1 text-xs font-bold shadow-[3px_3px_0px_0px_#000000]">
        <div className="flex items-center gap-1.5 font-black text-black uppercase mb-1">
          <Sparkles className="h-4 w-4" />
          <span>FASTEST PATH TO BOOST READINESS:</span>
        </div>
        <p className="text-neutral-900 leading-snug">
          Lowering your requested loan amount by 10% or adding a co-borrower earning ₹40,000+/month
          will decrease your FOIR from {assessment.foir_percentage.toFixed(1)}% to under 40%,
          potentially raising your overall readiness score to 90+.
        </p>
      </div>

      {/* Regulatory Disclaimer */}
      <div className="p-3 bg-[#FAF8F5] border-2 border-black text-[11px] font-bold text-neutral-700 flex items-start gap-2">
        <Info className="h-4 w-4 text-black shrink-0 mt-0.5" />
        <span>
          <strong>Advisory Notice:</strong> Finora Readiness Score is an educational and advisory metric evaluated against standard public underwriting criteria. It does not guarantee sanction by any financial institution.
        </span>
      </div>
    </div>
  );
}
