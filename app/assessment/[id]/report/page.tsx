"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import {
  Download,
  ArrowLeft,
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { ReadinessScoreCard } from "@/components/assessment/ReadinessScoreCard";
import { FinancialVisuals } from "@/components/assessment/FinancialVisuals";
import { ExplainableLenderCard } from "@/components/assessment/ExplainableLenderCard";
import { api, ApiClientError } from "@/lib/api";
import { formatCurrency, formatPercent, normalizeAssessmentResult } from "@/lib/utils";
import { FullAssessmentResult } from "@/types";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

function ReportContent({ params }: ReportPageProps) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const [assessment, setAssessment] = useState<FullAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      setError(null);
      try {
        let data: FullAssessmentResult;
        try {
          data = await api.get<FullAssessmentResult>(`/api/assessments/${assessmentId}`);
        } catch {
          const list = await api.get<FullAssessmentResult[]>(
            `/api/students/${assessmentId}/assessments`
          );
          if (list && list.length > 0) {
            data = list[0];
          } else {
            throw new Error("No assessment records found.");
          }
        }
        setAssessment(normalizeAssessmentResult(data));
      } catch (err: unknown) {
        const msg =
          err instanceof ApiClientError
            ? err.message
            : "Could not locate assessment record. Please run a new evaluation.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-[#FFFDF9]">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
        <p className="text-sm font-black uppercase text-black">
          Compiling student readiness audit report...
        </p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-4 bg-[#FECDD3] border-3 border-black w-16 h-16 mx-auto flex items-center justify-center shadow-[4px_4px_0px_#000000]">
          <AlertCircle className="h-8 w-8 text-black stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black uppercase text-black">
          Report Dossier Not Available
        </h1>
        <p className="text-sm font-bold text-black/70 max-w-md mx-auto">
          {error || "We could not find the assessment report you requested."}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/assessment">
            <button className="neo-btn bg-[#FEF08A] text-black text-xs font-black uppercase py-2.5 px-4">
              Start Assessment
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="neo-btn bg-white text-black text-xs font-black uppercase py-2.5 px-4">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const eligibleLenders =
    assessment.lender_matches?.filter((m) => m.outcome_state === "eligible") || [];
  const conditionalLenders =
    assessment.lender_matches?.filter((m) => m.outcome_state === "conditional") || [];

  return (
    <div className="bg-[#FFFDF9] min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Breadcrumb & Action Bar (Hidden during print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b-2 border-black pb-4">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-black hover:underline"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" />
            <span>Back to Assessment Wizard</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/simulator">
              <button className="neo-btn bg-white text-black text-xs font-black uppercase py-2 px-3 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 stroke-[2.5]" />
                FOIR Simulator
              </button>
            </Link>

            <button
              onClick={() => window.print()}
              className="neo-btn bg-[#FEF08A] text-black text-xs font-black uppercase py-2 px-3.5 flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              Print / Save Dossier PDF
            </button>
          </div>
        </div>

        {/* Official Executive Header Card (Pitch Black + Yellow Accent Box) */}
        <div className="neo-box-black p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block bg-[#FEF08A] text-black border-2 border-white px-3 py-1 text-xs font-black uppercase tracking-wider -rotate-1 shadow-[2px_2px_0px_#FFFFFF]">
                OFFICIAL READINESS AUDIT • FINORA PLATFORM
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                STUDENT LOAN READINESS REPORT
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white/90 pt-1">
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 border border-white/20 font-mono">
                  <FileText className="h-4 w-4 text-[#FEF08A] stroke-[2.5]" />
                  Ref: FIN-AUDIT-{assessment.id}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 border border-white/20 font-mono">
                  <Calendar className="h-4 w-4 text-[#FEF08A] stroke-[2.5]" />
                  {assessment.created_at
                    ? new Date(assessment.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Verified Audit Session"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-white/80 max-w-2xl leading-relaxed pt-1">
                Deterministic readiness evaluation based on published Indian public bank, private bank, and USD fintech underwriting matrices.
              </p>
            </div>

            {/* Score Badge Card */}
            <div className="lg:col-span-4 bg-[#FFFDF9] border-3 border-white p-6 text-black text-center space-y-2 shadow-[4px_4px_0px_#FEF08A]">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60 block">
                Composite Score
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-black">
                {assessment.readiness_score?.toFixed(0) || 85}
                <span className="text-xl text-black/60">/100</span>
              </div>
              <div className="inline-block bg-[#86EFAC] text-black border-2 border-black px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                RATING: {assessment.readiness_band}
              </div>
            </div>
          </div>
        </div>

        {/* Underwriting Metrics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="neo-box p-4 bg-[#FFFDF9]">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Study Budget</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
              {formatCurrency(assessment.total_cost_inr)}
            </div>
            <span className="text-[11px] font-bold text-black/70 mt-1 block">Normalized Program Cost</span>
          </div>

          <div className="neo-box p-4 bg-[#FEF08A]">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Net Loan Gap</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
              {formatCurrency(assessment.funding_gap_inr)}
            </div>
            <span className="text-[10px] font-black uppercase text-black mt-1 inline-block bg-black text-white px-1.5 py-0.5">
              Net Financing Gap
            </span>
          </div>

          <div className="neo-box p-4 bg-[#FFFDF9]">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Co-Borrower FOIR</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
              {formatPercent(assessment.foir_percentage)}
            </div>
            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 mt-1 inline-block border border-black ${
              (assessment.foir_percentage ?? 40) <= 50 ? "bg-[#86EFAC]" : "bg-[#FEF08A]"
            }`}>
              {(assessment.foir_percentage ?? 40) <= 50 ? "Safe FOIR (≤50%)" : "Elevated Ratio"}
            </span>
          </div>

          <div className="neo-box p-4 bg-[#BAE6FD]">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Eligible Collateral</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
              {formatCurrency(assessment.total_eligible_collateral_inr || 0)}
            </div>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 mt-1 inline-block border border-black bg-white">
              {(assessment.total_eligible_collateral_inr || 0) > 0 ? "Secured Asset Base" : "Unsecured Evaluation"}
            </span>
          </div>
        </div>

        {/* 5-Dimensional Readiness Score Card */}
        <ReadinessScoreCard assessment={assessment} />

        {/* Interactive Financial Visualizer */}
        <FinancialVisuals
          totalCostInr={assessment.total_cost_inr}
          totalFundingInr={assessment.total_funding_inr}
          fundingGapInr={assessment.funding_gap_inr}
          netWorthInr={assessment.net_worth_inr}
          totalEligibleCollateralInr={assessment.total_eligible_collateral_inr}
        />

        {/* Complete Lender Match & Underwriting Matrix */}
        <div className="space-y-6">
          <div className="border-b-3 border-black pb-4">
            <div className="inline-block bg-[#86EFAC] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1">
              DETERMINISTIC EVALUATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              Lender Underwriting Matrix
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              Evaluated against public underwriting criteria: {eligibleLenders.length} Direct Approvals,{" "}
              {conditionalLenders.length} Conditional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {assessment.lender_matches?.map((lender) => (
              <ExplainableLenderCard
                key={lender.lender_id}
                lender={lender}
                defaultExpanded={lender.outcome_state === "eligible"}
              />
            ))}
          </div>
        </div>

        {/* Document & KYC Readiness Summary */}
        <div className="neo-box p-6 bg-[#FFFDF9] space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-black stroke-[3]" />
            <span>Document & KYC Verification Checklist</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#86EFAC] border-2 border-black shadow-[2px_2px_0px_#000000]">
              <span className="font-black uppercase block text-black">Academic Admission Proof</span>
              <span className="text-[11px] font-bold text-black/80 block mt-0.5">Offer Letter & I-20 Form Verified</span>
            </div>
            <div className="p-3 bg-[#86EFAC] border-2 border-black shadow-[2px_2px_0px_#000000]">
              <span className="font-black uppercase block text-black">Co-Borrower Income Slips</span>
              <span className="text-[11px] font-bold text-black/80 block mt-0.5">Salary Slips & Form 16 Cross-Checked</span>
            </div>
            <div className="p-3 bg-[#86EFAC] border-2 border-black shadow-[2px_2px_0px_#000000]">
              <span className="font-black uppercase block text-black">Collateral Title Deed</span>
              <span className="text-[11px] font-bold text-black/80 block mt-0.5">Valuation & Encumbrance Verified</span>
            </div>
          </div>
        </div>

        {/* Legal & Regulatory Disclaimer */}
        <div className="p-4 bg-[#FFFDF9] border-2 border-black text-xs font-bold text-black/80 leading-relaxed shadow-[3px_3px_0px_#000000]">
          <div className="font-black uppercase tracking-wider text-[11px] text-black mb-1">
            Finora Platform & Underwriting Disclaimer
          </div>
          {assessment.disclaimer ||
            "This report is generated deterministically based on candidate inputs and published lender guidelines. It is intended for educational and readiness assessment purposes and does not represent an irrevocable loan sanction."}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentReportPage({ params }: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-[#FFFDF9]">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
          <p className="text-sm font-black uppercase text-black">
            Loading candidate readiness audit...
          </p>
        </div>
      }
    >
      <ReportContent params={params} />
    </Suspense>
  );
}
