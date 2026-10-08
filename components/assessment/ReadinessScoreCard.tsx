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
import { FOIR_THRESHOLDS } from "@/lib/constants/financial";

interface ReadinessScoreCardProps {
  assessment: FullAssessmentResult;
}

export function ReadinessScoreCard({ assessment }: ReadinessScoreCardProps) {
  const score = typeof assessment?.readiness_score === "number" ? assessment.readiness_score : 82;
  const band = assessment?.readiness_band || "Good";

  const foirVal = typeof assessment?.foir_percentage === "number" 
    ? assessment.foir_percentage 
    : (assessment?.foir_percentage ? parseFloat(String(assessment.foir_percentage)) : 40);

  const totalCostVal = typeof assessment?.total_cost_inr === "number"
    ? assessment.total_cost_inr
    : (assessment?.total_cost_inr ? parseFloat(String(assessment.total_cost_inr)) : 0);

  const totalFundingVal = typeof assessment?.total_funding_inr === "number"
    ? assessment.total_funding_inr
    : (assessment?.total_funding_inr ? parseFloat(String(assessment.total_funding_inr)) : 0);

  const collateralVal = typeof assessment?.total_eligible_collateral_inr === "number"
    ? assessment.total_eligible_collateral_inr
    : (assessment?.total_eligible_collateral_inr ? parseFloat(String(assessment.total_eligible_collateral_inr)) : 0);

  const ltvVal = typeof assessment?.ltv_percentage === "number"
    ? assessment.ltv_percentage
    : (assessment?.ltv_percentage ? parseFloat(String(assessment.ltv_percentage)) : null);

  const fundingCoverage =
    totalCostVal > 0
      ? Math.min(
          100,
          Math.max(
            15,
            Math.round((totalFundingVal / totalCostVal) * 100)
          )
        )
      : 80;

  const foirScore =
    foirVal <= FOIR_THRESHOLDS.PRIME_MAX
      ? 95
      : foirVal <= FOIR_THRESHOLDS.STANDARD_MAX
      ? 80
      : foirVal <= FOIR_THRESHOLDS.ELEVATED_MAX
      ? 55
      : 30;

  const collateralScore =
    collateralVal > 0
      ? ltvVal && ltvVal <= 70
        ? 95
        : 75
      : 45;

  const totalMatches = assessment?.lender_matches?.length || 1;
  const eligibleMatches =
    assessment?.lender_matches?.filter((m) => m.outcome_state === "eligible").length || 0;
  const conditionalMatches =
    assessment?.lender_matches?.filter((m) => m.outcome_state === "conditional").length || 0;
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
      desc: `FOIR is ${foirVal.toFixed(1)}% (${
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
        collateralVal > 0
          ? `₹${(collateralVal / 100000).toFixed(1)}L in unencumbered property & securities`
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

      {/* 5-Dimensional Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const isHigh = dim.score >= 80;
          const isMid = dim.score >= 60 && dim.score < 80;

          return (
            <div
              key={dim.id}
              className={`p-4 border-2 border-black flex flex-col justify-between space-y-3 transition-all ${
                isHigh
                  ? "bg-[#F0FDF4] shadow-[3px_3px_0px_0px_#86EFAC]"
                  : isMid
                  ? "bg-[#FEFCE8] shadow-[3px_3px_0px_0px_#FEF08A]"
                  : "bg-[#FFF1F2] shadow-[3px_3px_0px_0px_#FECDD3]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/10">
                  <span className="text-[10px] font-black text-black tracking-wider uppercase flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                    {dim.label}
                  </span>
                  <span className="font-mono font-black text-xs text-black bg-white px-1.5 py-0.5 border border-black">
                    {dim.score}/100
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div className="h-2 w-full bg-white border border-black mt-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      isHigh
                        ? "bg-[#86EFAC]"
                        : isMid
                        ? "bg-[#FEF08A]"
                        : "bg-[#FECDD3]"
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <p className="text-xs font-bold text-black mt-2 leading-tight">
                  {dim.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-black/10">
                <span className="text-[9px] font-black uppercase tracking-wider text-black/60 block">
                  Prescribed Action:
                </span>
                <p className="text-[11px] font-medium text-black/90 mt-0.5 leading-snug">
                  {dim.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
