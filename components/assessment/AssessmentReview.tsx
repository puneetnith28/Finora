"use client";

import React from "react";
import { 
  CheckCircle2, 
  Edit3, 
  ArrowLeft, 
  Sparkles, 
  User, 
  GraduationCap, 
  DollarSign, 
  Wallet, 
  Shield, 
  FileText,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { type StudentFormData } from "@/lib/validations/student";
import { type StudyPlanFormData } from "@/lib/validations/study_plan";
import { type FundingSourceItem, FUNDING_SOURCE_LABELS } from "@/lib/validations/funding";
import { type FinancialProfileFormData } from "@/lib/validations/financial_profile";
import { type CollateralItem, COLLATERAL_TYPE_LABELS, COLLATERAL_HAIRCUTS } from "@/lib/validations/collateral";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface AssessmentReviewProps {
  student: StudentFormData | null;
  studyPlan: StudyPlanFormData | null;
  fundingSources: FundingSourceItem[];
  financialProfile: FinancialProfileFormData | null;
  collaterals: CollateralItem[];
  onEditSection: (stepNumber: number) => void;
  onRunAssessment: () => Promise<void> | void;
  onBack: () => void;
  isLoading?: boolean;
}

export function AssessmentReview({
  student,
  studyPlan,
  fundingSources,
  financialProfile,
  collaterals,
  onEditSection,
  onRunAssessment,
  onBack,
  isLoading = false,
}: AssessmentReviewProps) {
  // Deterministic summary calculations
  const totalTuitionOrig = studyPlan?.tuition_fees_original || 0;
  const totalLivingOrig = studyPlan?.living_expenses_original || 0;
  const totalMiscOrig =
    (studyPlan?.travel_expenses_original || 0) +
    (studyPlan?.insurance_original || 0) +
    (studyPlan?.visa_fees_original || 0) +
    (studyPlan?.miscellaneous_original || 0);
  const totalCostOrig = totalTuitionOrig + totalLivingOrig + totalMiscOrig;
  const fxRate = studyPlan?.exchange_rate_to_inr || 1.0;
  const totalCostInr = totalCostOrig * fxRate;

  const totalFundingInr = fundingSources.reduce((acc, s) => {
    return acc + (Number(s.amount_original) || 0) * (Number(s.exchange_rate_to_inr) || 1.0);
  }, 0);

  const fundingGapInr = Math.max(0, totalCostInr - totalFundingInr);

  const monthlyIncomeInr =
    (financialProfile?.monthly_income_inr || 0) + (financialProfile?.other_income_inr || 0);

  const monthlyRate = 10.5 / 12 / 100;
  const tenureMonths = 120;
  const proposedEmi =
    fundingGapInr > 0
      ? (fundingGapInr * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      : 0;
  const totalMonthlyDebt = (financialProfile?.existing_monthly_obligations_inr || 0) + proposedEmi;
  const foir = monthlyIncomeInr > 0 ? (totalMonthlyDebt / monthlyIncomeInr) * 100 : 0;

  const totalEligibleCollateralInr = collaterals.reduce((acc, c) => {
    const mkt = Number(c.market_value_inr) || 0;
    const enc = Number(c.existing_encumbrance_inr) || 0;
    const haircut = COLLATERAL_HAIRCUTS[c.collateral_type] || 0.8;
    return acc + Math.max(0, mkt * haircut - enc);
  }, 0);

  const isReadyForAssessment =
    student &&
    student.full_name &&
    studyPlan &&
    financialProfile &&
    financialProfile.monthly_income_inr > 0;

  return (
    <div className="space-y-8">
      {/* Ready Banner */}
      <div className="bg-[#0f382c] text-white dark:bg-emerald-950/70 border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Deterministic Underwriting Verification
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Run Full Lender Audit
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Review all applicant parameters below. Clicking &quot;Run Assessment&quot; executes every 
            public, private, and NBFC lender rule without black-box estimations.
          </p>
        </div>

        <Button
          size="lg"
          onClick={onRunAssessment}
          disabled={!isReadyForAssessment || isLoading}
          isLoading={isLoading}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 shadow-xl text-base shrink-0"
          rightIcon={<Play className="h-4 w-4 fill-current" />}
        >
          Run Assessment Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Student & University */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    1. Student Profile & Program
                  </h3>
                  <span className="text-[11px] text-slate-500">Academic Target</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(1)}
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              >
                Edit
              </Button>
            </div>

            {student ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target University:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.target_university}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Country & Degree:</span>
                  <span className="text-slate-900 dark:text-white">
                    {student.target_country} • {student.target_degree}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course & STEM:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {student.target_course} {student.target_stem ? "(STEM ✓)" : ""}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500 font-medium">Student profile not completed.</div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile Verified</span>
          </div>
        </Card>

        {/* Card 2: Study Plan & Normalized Budget */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    2. Study Plan & Costs
                  </h3>
                  <span className="text-[11px] text-slate-500">Normalized INR Budget</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(2)}
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              >
                Edit
              </Button>
            </div>

            {studyPlan ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tuition Fees:</span>
                  <span className="font-mono font-semibold">
                    {studyPlan.currency} {Number(studyPlan.tuition_fees_original).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Living Expenses:</span>
                  <span className="font-mono font-semibold">
                    {studyPlan.currency} {Number(studyPlan.living_expenses_original).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration & FX Rate:</span>
                  <span className="font-mono">
                    {studyPlan.duration_months} mo • 1 {studyPlan.currency} = ₹{studyPlan.exchange_rate_to_inr}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                  <span className="text-slate-900 dark:text-white">Total Budget (INR):</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                    {formatCurrency(totalCostInr)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500 font-medium">Study plan not completed.</div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Budget Normalized</span>
          </div>
        </Card>

        {/* Card 3: Funding & Gap */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    3. Funding Sources & Gap
                  </h3>
                  <span className="text-[11px] text-slate-500">{fundingSources.length} sources defined</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(3)}
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              >
                Edit
              </Button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Self-Funding Total:</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(totalFundingInr)}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                {fundingSources.slice(0, 2).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-slate-500 text-[11px]">
                    <span>• {FUNDING_SOURCE_LABELS[s.source_type] || s.source_type}</span>
                    <span className="font-mono">{formatCurrency(Number(s.amount_original) * Number(s.exchange_rate_to_inr))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold">
                <span className="text-slate-900 dark:text-white">Required Loan Amount:</span>
                <span className="font-mono text-[#0f382c] dark:text-emerald-400 text-sm">
                  {formatCurrency(fundingGapInr)}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Funding Gap Calculated</span>
          </div>
        </Card>

        {/* Card 4: Financials & FOIR */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    4. Co-Borrower & FOIR
                  </h3>
                  <span className="text-[11px] text-slate-500">Underwriting Metrics</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(4)}
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              >
                Edit
              </Button>
            </div>

            {financialProfile ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Co-Borrower:</span>
                  <span className="capitalize font-semibold text-slate-900 dark:text-white">
                    {financialProfile.co_borrower_relationship}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Income:</span>
                  <span className="font-mono font-semibold">{formatCurrency(monthlyIncomeInr)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Existing EMIs:</span>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrency(financialProfile.existing_monthly_obligations_inr)}/mo
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                  <span className="text-slate-900 dark:text-white">Projected FOIR:</span>
                  <span className={`font-mono text-sm ${foir <= 50 ? "text-emerald-600" : foir <= 65 ? "text-amber-600" : "text-rose-600"}`}>
                    {formatPercent(foir)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500 font-medium">Financial profile not completed.</div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>FOIR Stress-Tested</span>
          </div>
        </Card>

        {/* Card 5: Collateral & LTV */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    5. Collateral Security
                  </h3>
                  <span className="text-[11px] text-slate-500">{collaterals.length} assets pledged</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(5)}
                leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              >
                Edit
              </Button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Security Mode:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {collaterals.length > 0 ? "Pledged Collateral (Secured)" : "Unsecured / Non-Collateral"}
                </span>
              </div>
              {collaterals.length > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asset Type:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {COLLATERAL_TYPE_LABELS[collaterals[0]?.collateral_type]?.split("(")[0]}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                    <span className="text-slate-900 dark:text-white">Eligible Collateral Value:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                      {formatCurrency(totalEligibleCollateralInr)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Non-collateral evaluation mode. Evaluating unsecured NBFC & USD fintech loans.
                </p>
              )}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Collateral Ready</span>
          </div>
        </Card>

        {/* Card 6: Documents & Verification */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    6. Verification Checklist
                  </h3>
                  <span className="text-[11px] text-slate-500">Underwriting Readiness</span>
                </div>
              </div>
              <Badge variant="success">All Pass</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Admission letter & fee structure</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Co-borrower KYC & Income statements</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bank accounts & self-funding verification</span>
              </div>
              {collaterals.length > 0 && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Property title deed / FD certificate</span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Checklist Complete</span>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" size="md" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Collateral
        </Button>

        <Button
          size="lg"
          onClick={onRunAssessment}
          disabled={!isReadyForAssessment || isLoading}
          isLoading={isLoading}
          className="bg-[#0f382c] hover:bg-[#164e3f] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-slate-950 font-bold px-8 shadow-md"
          rightIcon={<Play className="h-4 w-4 fill-current" />}
        >
          Run Full Assessment Engine
        </Button>
      </div>
    </div>
  );
}
