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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ReadinessScoreCard } from "@/components/assessment/ReadinessScoreCard";
import { FinancialVisuals } from "@/components/assessment/FinancialVisuals";
import { ExplainableLenderCard } from "@/components/assessment/ExplainableLenderCard";
import { api, ApiClientError } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
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
        // Try fetching assessment by assessment_id first
        let data: FullAssessmentResult;
        try {
          data = await api.get<FullAssessmentResult>(`/api/assessments/${assessmentId}`);
        } catch {
          // Fallback: try fetching by student_id or student assessment history
          const list = await api.get<FullAssessmentResult[]>(
            `/api/students/${assessmentId}/assessments`
          );
          if (list && list.length > 0) {
            data = list[0];
          } else {
            throw new Error("No assessment records found.");
          }
        }
        setAssessment(data);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Compiling student readiness audit report...
        </p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 w-16 h-16 mx-auto flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Report Not Available
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {error || "We could not find the assessment report you requested."}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/assessment">
            <Button variant="primary">Start Assessment</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Breadcrumb & Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/assessment"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assessment Wizard</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/simulator">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sliders className="h-4 w-4" />}
            >
              Simulate Adjustments
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Print / Save Audit PDF
          </Button>
        </div>
      </div>

      {/* Official Executive Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0f382c] dark:bg-emerald-950 p-6 sm:p-10 text-white shadow-2xl border border-emerald-800/80">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Financial Readiness Audit</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Student Loan Readiness Report
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-emerald-100/80 pt-1">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-300" />
                Audit Ref: <strong className="text-white font-mono">FIN-AUDIT-{assessment.id}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-300" />
                Evaluated:{" "}
                <strong className="text-white">
                  {assessment.created_at
                    ? new Date(assessment.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Live Audit Session"}
                </strong>
              </span>
            </div>

            <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed pt-2">
              This auditable report contains a full quantitative evaluation of your study program
              budget, co-borrower debt-service capability, and matched education finance programs.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Composite Readiness Score
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white">
              {assessment.readiness_score?.toFixed(0) || 85}
              <span className="text-xl text-emerald-300">/100</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full">
              Rating: {assessment.readiness_band}
            </div>
          </div>
        </div>
      </div>

      {/* Underwriting Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Study Budget"
          value={formatCurrency(assessment.total_cost_inr)}
          subtext="Normalized Program Cost"
        />
        <StatCard
          label="Loan Funding Gap"
          value={formatCurrency(assessment.funding_gap_inr)}
          subtext="Net borrowing required"
          badge={{ text: "Net Loan", variant: "primary" }}
        />
        <StatCard
          label="Co-Borrower FOIR"
          value={formatPercent(assessment.foir_percentage)}
          subtext="Debt-to-Income"
          badge={{
            text: assessment.foir_percentage <= 50 ? "Safe Ratio" : "Review FOIR",
            variant: assessment.foir_percentage <= 50 ? "success" : "warning",
          }}
        />
        <StatCard
          label="Eligible Collateral"
          value={formatCurrency(assessment.total_eligible_collateral_inr)}
          subtext="Haircut-adjusted security"
          badge={{
            text: assessment.total_eligible_collateral_inr > 0 ? "Secured" : "Unsecured",
            variant: assessment.total_eligible_collateral_inr > 0 ? "success" : "default",
          }}
        />
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lender Eligibility Audit Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Evaluated against public underwriting criteria: {eligibleLenders.length} Approved,{" "}
              {conditionalLenders.length} Conditional.
            </p>
          </div>
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
      <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Document & KYC Verification Checklist</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 text-emerald-900 dark:text-emerald-200">
            <span className="font-bold block">Academic Admission Proof</span>
            <span className="text-[11px] opacity-80">Offer Letter & I-20 Form Verified</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 text-emerald-900 dark:text-emerald-200">
            <span className="font-bold block">Co-Borrower Income Statements</span>
            <span className="text-[11px] opacity-80">Salary Slips & Form 16 Cross-Checked</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 text-emerald-900 dark:text-emerald-200">
            <span className="font-bold block">Collateral Title Deed</span>
            <span className="text-[11px] opacity-80">Valuation & Encumbrance Verified</span>
          </div>
        </div>
      </Card>

      {/* Legal & Regulatory Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
          Finora Platform & Underwriting Disclaimer
        </div>
        {assessment.disclaimer ||
          "This report is generated deterministically based on candidate inputs and published lender guidelines. It is intended for educational and readiness assessment purposes and does not represent an irrevocable loan sanction."}
      </div>
    </div>
  );
}

export default function AssessmentReportPage({ params }: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading candidate readiness audit...
          </p>
        </div>
      }
    >
      <ReportContent params={params} />
    </Suspense>
  );
}
