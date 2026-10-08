"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { StepNavigation } from "@/components/StepNavigation";
import { StudentProfileForm } from "@/components/assessment/StudentProfileForm";
import { StudyPlanForm } from "@/components/assessment/StudyPlanForm";
import { FundingForm } from "@/components/assessment/FundingForm";
import { FinancialProfileForm } from "@/components/assessment/FinancialProfileForm";
import { CollateralForm } from "@/components/assessment/CollateralForm";
import { AssessmentReview } from "@/components/assessment/AssessmentReview";
import { AssessmentResults, type FullAssessmentResult } from "@/components/assessment/AssessmentResults";
import { type StudentFormData } from "@/lib/validations/student";
import { type StudyPlanFormData } from "@/lib/validations/study_plan";
import { type FundingSourceItem } from "@/lib/validations/funding";
import { type FinancialProfileFormData } from "@/lib/validations/financial_profile";
import { type CollateralItem } from "@/lib/validations/collateral";
import { api, ApiClientError } from "@/lib/api";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const parsedStep = stepParam ? parseInt(stepParam, 10) : 1;
  const initialStep = !isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 6 ? parsedStep : 1;

  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [maxStepUnlocked, setMaxStepUnlocked] = useState<number>(6);
  const [studentId, setStudentId] = useState<number | null>(null);

  // Assessment State
  const [student, setStudent] = useState<StudentFormData | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanFormData | null>(null);
  const [fundingSources, setFundingSources] = useState<FundingSourceItem[]>([]);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfileFormData | null>(null);
  const [collaterals, setCollaterals] = useState<CollateralItem[]>([]);

  // Assessment Result
  const [assessmentResult, setAssessmentResult] = useState<FullAssessmentResult | null>(null);

  // Loading & Alert state
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  // Step 1: Save Student Profile
  const handleStudentSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    setAlert(null);
    try {
      setStudent(data);
      // Call API
      let res: { id: number };
      if (studentId) {
        res = await api.put<{ id: number }>(`/api/students/${studentId}`, data);
      } else {
        res = await api.post<{ id: number }>("/api/students", data);
      }
      setStudentId(res.id);
      showAlert("success", "Student profile saved successfully.");
      setCurrentStep(2);
      setMaxStepUnlocked((prev) => Math.max(prev, 2));
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : "Failed to save student profile.";
      showAlert("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save Study Plan
  const handleStudyPlanSubmit = async (data: StudyPlanFormData) => {
    if (!studentId) {
      showAlert("error", "Please save student profile first.");
      setCurrentStep(1);
      return;
    }
    setIsLoading(true);
    setAlert(null);
    try {
      setStudyPlan(data);
      await api.post(`/api/students/${studentId}/study-plan`, data);
      showAlert("success", "Study plan and cost breakdown saved.");
      setCurrentStep(3);
      setMaxStepUnlocked((prev) => Math.max(prev, 3));
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : "Failed to save study plan.";
      showAlert("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Save Funding Sources
  const handleFundingSubmit = async (sources: FundingSourceItem[]) => {
    if (!studentId) {
      showAlert("error", "Please save student profile first.");
      setCurrentStep(1);
      return;
    }
    setIsLoading(true);
    setAlert(null);
    try {
      setFundingSources(sources);
      // Save each funding source to the student
      for (const src of sources) {
        await api.post(`/api/students/${studentId}/funding-sources`, {
          source_type: src.source_type,
          amount_original: src.amount_original,
          currency: src.currency,
          exchange_rate_to_inr: src.exchange_rate_to_inr,
          description: src.description,
          verified: src.verified,
        });
      }
      showAlert("success", "Funding sources and self-contribution saved.");
      setCurrentStep(4);
      setMaxStepUnlocked((prev) => Math.max(prev, 4));
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : "Failed to save funding sources.";
      showAlert("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Save Financial Profile, Assets & Liabilities
  const handleFinancialProfileSubmit = async (data: FinancialProfileFormData) => {
    if (!studentId) {
      showAlert("error", "Please save student profile first.");
      setCurrentStep(1);
      return;
    }
    setIsLoading(true);
    setAlert(null);
    try {
      setFinancialProfile(data);
      await api.post(`/api/students/${studentId}/financial-profile`, {
        co_borrower_relationship: data.co_borrower_relationship,
        monthly_income_inr: data.monthly_income_inr,
        other_income_inr: data.other_income_inr,
        existing_monthly_obligations_inr: data.existing_monthly_obligations_inr,
        monthly_living_expenses_inr: data.monthly_living_expenses_inr,
        cibil_score: data.cibil_score,
      });

      // Save assets
      for (const asset of data.assets) {
        await api.post(`/api/students/${studentId}/assets`, asset);
      }

      // Save liabilities
      for (const liability of data.liabilities) {
        await api.post(`/api/students/${studentId}/liabilities`, liability);
      }

      showAlert("success", "Financial profile, assets, and debts saved.");
      setCurrentStep(5);
      setMaxStepUnlocked((prev) => Math.max(prev, 5));
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : "Failed to save financial profile.";
      showAlert("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Save Collaterals
  const handleCollateralSubmit = async (items: CollateralItem[]) => {
    if (!studentId) {
      showAlert("error", "Please save student profile first.");
      setCurrentStep(1);
      return;
    }
    setIsLoading(true);
    setAlert(null);
    try {
      setCollaterals(items);
      for (const item of items) {
        await api.post(`/api/students/${studentId}/collaterals`, item);
      }
      showAlert("success", "Pledged security and collateral saved.");
      setCurrentStep(6);
      setMaxStepUnlocked((prev) => Math.max(prev, 6));
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : "Failed to save collateral assets.";
      showAlert("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Run Full Assessment Evaluation
  const handleRunAssessment = async () => {
    if (!studentId) {
      showAlert("error", "Student profile not found. Please start from Step 1.");
      setCurrentStep(1);
      return;
    }
    setIsLoading(true);
    setAlert(null);
    try {
      const res = await api.post<FullAssessmentResult>("/api/assessments/evaluate", {
        student_id: studentId,
      });
      setAssessmentResult(res);
      showAlert("success", "Assessment completed successfully with full rule audit.");
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : "Failed to execute assessment.";
      showAlert("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed totals for current step state
  const totalCostInr =
    (studyPlan?.tuition_fees_original || 0) * (studyPlan?.exchange_rate_to_inr || 84.5) +
    (studyPlan?.living_expenses_original || 0) * (studyPlan?.exchange_rate_to_inr || 84.5);

  const totalFundingInr = fundingSources.reduce((acc, s) => {
    return acc + (Number(s.amount_original) || 0) * (Number(s.exchange_rate_to_inr) || 1.0);
  }, 0);

  const fundingGapInr = Math.max(0, totalCostInr - totalFundingInr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Alert Banner */}
      {alert && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
            alert.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs uppercase font-bold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Render Assessment Results if ready, else render multi-step flow */}
      {assessmentResult ? (
        <AssessmentResults
          assessment={assessmentResult}
          onReset={() => {
            setAssessmentResult(null);
            setCurrentStep(1);
          }}
        />
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Education Loan Readiness Assessment
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Complete the 6 steps below to evaluate your profile against all lender underwriting matrices.
            </p>
          </div>

          <StepNavigation
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
            maxStepUnlocked={maxStepUnlocked}
          />

          <div className="mt-8">
            {currentStep === 1 && (
              <StudentProfileForm
                initialData={student || undefined}
                onSubmit={handleStudentSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === 2 && (
              <StudyPlanForm
                initialData={studyPlan || undefined}
                onSubmit={handleStudyPlanSubmit}
                onBack={() => setCurrentStep(1)}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && (
              <FundingForm
                totalCostInr={totalCostInr || 4500000}
                initialSources={fundingSources}
                onSubmit={handleFundingSubmit}
                onBack={() => setCurrentStep(2)}
                isLoading={isLoading}
              />
            )}

            {currentStep === 4 && (
              <FinancialProfileForm
                fundingGapInr={fundingGapInr || 3500000}
                initialData={financialProfile || undefined}
                onSubmit={handleFinancialProfileSubmit}
                onBack={() => setCurrentStep(3)}
                isLoading={isLoading}
              />
            )}

            {currentStep === 5 && (
              <CollateralForm
                requestedLoanInr={fundingGapInr || 3500000}
                initialCollaterals={collaterals}
                onSubmit={handleCollateralSubmit}
                onBack={() => setCurrentStep(4)}
                isLoading={isLoading}
              />
            )}

            {currentStep === 6 && (
              <AssessmentReview
                student={student}
                studyPlan={studyPlan}
                fundingSources={fundingSources}
                financialProfile={financialProfile}
                collaterals={collaterals}
                onEditSection={(step) => setCurrentStep(step)}
                onRunAssessment={handleRunAssessment}
                onBack={() => setCurrentStep(5)}
                isLoading={isLoading}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
