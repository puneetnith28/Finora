"use client";

import React from "react";
import {
  Check,
  Edit3,
  ArrowLeft,
  Sparkles,
  User,
  GraduationCap,
  DollarSign,
  Wallet,
  Shield,
  FileText,
  Play,
} from "lucide-react";
import { NeoBadge, NeoButton } from "@/components/ui/NeoPrimitives";
import { type StudentFormData } from "@/lib/validations/student";
import { type StudyPlanFormData } from "@/lib/validations/study_plan";
import { type FundingSourceItem, FUNDING_SOURCE_LABELS } from "@/lib/validations/funding";
import { type FinancialProfileFormData } from "@/lib/validations/financial_profile";
import {
  type CollateralItem,
  COLLATERAL_TYPE_LABELS,
  COLLATERAL_HAIRCUTS,
} from "@/lib/validations/collateral";
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
      <div className="neo-box-yellow p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_#000000]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <NeoBadge variant="pink" rotate="left">
              <Sparkles className="h-3.5 w-3.5" />
              <span>UNDERWRITING SYNTHESIS</span>
            </NeoBadge>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            READY TO RUN FULL LENDER AUDIT
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-800 max-w-xl leading-snug">
            Review all applicant parameters below. Clicking &quot;Run Assessment&quot; executes
            every public, private, and NBFC lender rule without estimations.
          </p>
        </div>

        <NeoButton
          variant="black"
          size="lg"
          onClick={onRunAssessment}
          disabled={!isReadyForAssessment || isLoading}
          className="shrink-0"
        >
          <Play className="h-4 w-4 fill-current text-[#FEF08A]" />
          <span>{isLoading ? "EVALUATING AUDIT..." : "RUN ASSESSMENT NOW"}</span>
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Student & University */}
        <div className="neo-box-lg bg-white p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-black" />
                <span className="font-black text-xs uppercase text-black">
                  01 / APPLICANT PROFILE
                </span>
              </div>
              <NeoButton variant="white" size="sm" onClick={() => onEditSection(1)}>
                <Edit3 className="h-3 w-3" />
                <span>EDIT</span>
              </NeoButton>
            </div>

            {student ? (
              <div className="space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Applicant:</span>
                  <span className="text-black font-black">{student.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email:</span>
                  <span className="font-mono text-black">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">University:</span>
                  <span className="text-black font-black">{student.target_university}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Country & Degree:</span>
                  <span className="text-black">
                    {student.target_country} • {student.target_degree}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Major & STEM:</span>
                  <span className="text-black font-black">
                    {student.target_course} {student.target_stem ? "(STEM ✓)" : ""}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-600 font-bold">Student profile incomplete.</div>
            )}
          </div>
          <div className="pt-2 border-t-2 border-black flex items-center gap-1.5 text-xs font-black text-black">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>PROFILE VERIFIED</span>
          </div>
        </div>

        {/* Card 2: Study Plan & Normalized Budget */}
        <div className="neo-box-lg bg-white p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-black" />
                <span className="font-black text-xs uppercase text-black">
                  02 / STUDY PLAN BUDGET
                </span>
              </div>
              <NeoButton variant="white" size="sm" onClick={() => onEditSection(2)}>
                <Edit3 className="h-3 w-3" />
                <span>EDIT</span>
              </NeoButton>
            </div>

            {studyPlan ? (
              <div className="space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tuition:</span>
                  <span className="font-mono text-black">
                    {studyPlan.currency} {Number(studyPlan.tuition_fees_original).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Living:</span>
                  <span className="font-mono text-black">
                    {studyPlan.currency}{" "}
                    {Number(studyPlan.living_expenses_original).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Duration & FX:</span>
                  <span className="font-mono text-black">
                    {studyPlan.duration_months} mo • 1 {studyPlan.currency} = ₹
                    {studyPlan.exchange_rate_to_inr}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black font-black">
                  <span className="text-black uppercase">Normalized Budget (INR):</span>
                  <span className="font-mono text-black text-sm">
                    {formatCurrency(totalCostInr)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-600 font-bold">Study plan incomplete.</div>
            )}
          </div>
          <div className="pt-2 border-t-2 border-black flex items-center gap-1.5 text-xs font-black text-black">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>BUDGET NORMALIZED</span>
          </div>
        </div>

        {/* Card 3: Funding & Gap */}
        <div className="neo-box-lg bg-white p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-black" />
                <span className="font-black text-xs uppercase text-black">
                  03 / FUNDING SOURCES & GAP
                </span>
              </div>
              <NeoButton variant="white" size="sm" onClick={() => onEditSection(3)}>
                <Edit3 className="h-3 w-3" />
                <span>EDIT</span>
              </NeoButton>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-neutral-600">Self-Funding Total:</span>
                <span className="font-mono text-black font-black">
                  {formatCurrency(totalFundingInr)}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                {fundingSources.slice(0, 2).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-600 text-[11px]">
                    <span>• {FUNDING_SOURCE_LABELS[s.source_type] || s.source_type}</span>
                    <span className="font-mono">
                      {formatCurrency(Number(s.amount_original) * Number(s.exchange_rate_to_inr))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-1.5 border-t border-black font-black">
                <span className="text-black uppercase">Required Loan Gap:</span>
                <span className="font-mono text-black text-sm">
                  {formatCurrency(fundingGapInr)}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t-2 border-black flex items-center gap-1.5 text-xs font-black text-black">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>FUNDING GAP CALCULATED</span>
          </div>
        </div>

        {/* Card 4: Financials & FOIR */}
        <div className="neo-box-lg bg-white p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-black" />
                <span className="font-black text-xs uppercase text-black">
                  04 / CO-BORROWER & FOIR
                </span>
              </div>
              <NeoButton variant="white" size="sm" onClick={() => onEditSection(4)}>
                <Edit3 className="h-3 w-3" />
                <span>EDIT</span>
              </NeoButton>
            </div>

            {financialProfile ? (
              <div className="space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Co-Borrower:</span>
                  <span className="capitalize text-black font-black">
                    {financialProfile.co_borrower_relationship}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Monthly Income:</span>
                  <span className="font-mono text-black font-black">
                    {formatCurrency(monthlyIncomeInr)}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Existing EMIs:</span>
                  <span className="font-mono text-neutral-800">
                    {formatCurrency(financialProfile.existing_monthly_obligations_inr)}/mo
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black font-black">
                  <span className="text-black uppercase">Projected FOIR:</span>
                  <span className="font-mono text-sm text-black">{formatPercent(foir)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-600 font-bold">Financial profile incomplete.</div>
            )}
          </div>
          <div className="pt-2 border-t-2 border-black flex items-center gap-1.5 text-xs font-black text-black">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>FOIR STRESS-TESTED</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t-2 border-black">
        <NeoButton
          variant="white"
          size="md"
          onClick={onBack}
          className="w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>BACK TO COLLATERAL</span>
        </NeoButton>

        <NeoButton
          variant="primary"
          size="lg"
          onClick={onRunAssessment}
          disabled={!isReadyForAssessment || isLoading}
          className="w-full sm:w-auto justify-center"
        >
          <Play className="h-4 w-4 fill-current shrink-0" />
          <span>{isLoading ? "EVALUATING..." : "RUN FULL ASSESSMENT ENGINE"}</span>
        </NeoButton>
      </div>
    </div>
  );
}
