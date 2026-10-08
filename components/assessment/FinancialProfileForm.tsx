"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Trash2,
  Wallet,
  Building,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/StatCard";
import { 
  financialProfileSchema, 
  type FinancialProfileFormData, 
  type AssetItem, 
  type LiabilityItem,
  ASSET_TYPE_LABELS,
  LIABILITY_TYPE_LABELS,
  FINANCIAL_PRESETS
} from "@/lib/validations/financial_profile";
import { formatCurrency } from "@/lib/utils";

export interface FinancialProfileFormProps {
  fundingGapInr: number;
  initialData?: Partial<FinancialProfileFormData>;
  onSubmit: (data: FinancialProfileFormData) => Promise<void> | void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function FinancialProfileForm({
  fundingGapInr,
  initialData,
  onSubmit,
  onBack,
  isLoading = false,
}: FinancialProfileFormProps) {
  const [formData, setFormData] = useState<FinancialProfileFormData>({
    co_borrower_relationship: initialData?.co_borrower_relationship || "father",
    monthly_income_inr: initialData?.monthly_income_inr ?? 150000,
    other_income_inr: initialData?.other_income_inr ?? 20000,
    existing_monthly_obligations_inr: initialData?.existing_monthly_obligations_inr ?? 15000,
    monthly_living_expenses_inr: initialData?.monthly_living_expenses_inr ?? 40000,
    cibil_score: initialData?.cibil_score ?? 780,
    assets: initialData?.assets && initialData.assets.length > 0 ? initialData.assets : [
      {
        asset_type: "residential_property",
        estimated_value_inr: 6000000,
        is_liquid: false,
        description: "Self-occupied house",
      },
      {
        asset_type: "savings_account",
        estimated_value_inr: 800000,
        is_liquid: true,
        description: "Bank deposits",
      },
    ],
    liabilities: initialData?.liabilities && initialData.liabilities.length > 0 ? initialData.liabilities : [
      {
        liability_type: "auto_loan",
        outstanding_amount_inr: 300000,
        monthly_emi_inr: 15000,
        description: "Car Loan",
      },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyPreset = (presetId: string) => {
    const preset = FINANCIAL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormData(preset.data);
      setErrors({});
    }
  };

  const handleFieldChange = (field: keyof FinancialProfileFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Asset handlers
  const addAsset = () => {
    setFormData((prev) => ({
      ...prev,
      assets: [
        ...prev.assets,
        {
          asset_type: "savings_account",
          estimated_value_inr: 500000,
          is_liquid: true,
          description: "",
        },
      ],
    }));
  };

  const removeAsset = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index),
    }));
  };

  const updateAsset = (index: number, field: keyof AssetItem, value: unknown) => {
    setFormData((prev) => {
      const updated = [...prev.assets];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, assets: updated };
    });
  };

  // Liability handlers
  const addLiability = () => {
    setFormData((prev) => ({
      ...prev,
      liabilities: [
        ...prev.liabilities,
        {
          liability_type: "personal_loan",
          outstanding_amount_inr: 200000,
          monthly_emi_inr: 8000,
          description: "",
        },
      ],
    }));
  };

  const removeLiability = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((_, i) => i !== index),
    }));
  };

  const updateLiability = (index: number, field: keyof LiabilityItem, value: unknown) => {
    setFormData((prev) => {
      const updated = [...prev.liabilities];
      updated[index] = { ...updated[index], [field]: value };

      // Auto sync existing obligations sum if desired
      const totalEmis = updated.reduce((acc, l) => acc + (Number(l.monthly_emi_inr) || 0), 0);
      return {
        ...prev,
        liabilities: updated,
        existing_monthly_obligations_inr: totalEmis > 0 ? totalEmis : prev.existing_monthly_obligations_inr,
      };
    });
  };

  // Live Deterministic Calculations
  const totalMonthlyIncome =
    (Number(formData.monthly_income_inr) || 0) + (Number(formData.other_income_inr) || 0);

  // Proposed loan EMI calculation (standard 10-year repayment at 10.5%)
  const monthlyRate = 10.5 / 12 / 100;
  const tenureMonths = 120;
  const proposedLoanEmi =
    fundingGapInr > 0
      ? (fundingGapInr * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      : 0;

  const totalMonthlyObligations =
    (Number(formData.existing_monthly_obligations_inr) || 0) + proposedLoanEmi;

  const foirPercent =
    totalMonthlyIncome > 0 ? (totalMonthlyObligations / totalMonthlyIncome) * 100 : 0;

  const totalAssetsValue = formData.assets.reduce(
    (acc, a) => acc + (Number(a.estimated_value_inr) || 0),
    0
  );
  const totalLiabilitiesValue = formData.liabilities.reduce(
    (acc, l) => acc + (Number(l.outstanding_amount_inr) || 0),
    0
  );
  const netWorth = totalAssetsValue - totalLiabilitiesValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = financialProfileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preset Quick Loader */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Co-Borrower Financial Profiles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FINANCIAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 hover:shadow-sm transition-all text-xs group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {preset.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Co-borrower Income Section */}
          <Card>
            <CardHeader>
              <CardTitle>4. Co-Borrower Income & Cash Flow</CardTitle>
              <CardDescription>
                Education loans require an earning co-signer (parent, spouse, or sibling) whose income backs loan repayment.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Co-Borrower Relationship"
                  value={formData.co_borrower_relationship}
                  onChange={(e) => handleFieldChange("co_borrower_relationship", e.target.value)}
                  options={[
                    { value: "father", label: "Father" },
                    { value: "mother", label: "Mother" },
                    { value: "spouse", label: "Spouse" },
                    { value: "sibling", label: "Brother / Sister" },
                    { value: "self", label: "Self (Working Professional)" },
                    { value: "legal_guardian", label: "Legal Guardian" },
                  ]}
                  required
                />

                <Input
                  label="Co-Borrower CIBIL Score"
                  type="number"
                  min={300}
                  max={900}
                  value={formData.cibil_score || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "cibil_score",
                      e.target.value ? parseInt(e.target.value, 10) : null
                    )
                  }
                  error={errors.cibil_score}
                  leftIcon={<CreditCard className="h-4 w-4" />}
                  helperText="Prime banks prefer ≥720-750."
                />

                <Input
                  label="Primary Monthly Salary / Business Income (₹)"
                  type="number"
                  min={0}
                  value={formData.monthly_income_inr}
                  onChange={(e) =>
                    handleFieldChange("monthly_income_inr", parseFloat(e.target.value) || 0)
                  }
                  error={errors.monthly_income_inr}
                  leftIcon={<Wallet className="h-4 w-4" />}
                  required
                />

                <Input
                  label="Other Monthly Income (Rent, Agriculture, Dividends) (₹)"
                  type="number"
                  min={0}
                  value={formData.other_income_inr}
                  onChange={(e) =>
                    handleFieldChange("other_income_inr", parseFloat(e.target.value) || 0)
                  }
                  error={errors.other_income_inr}
                  leftIcon={<TrendingUp className="h-4 w-4" />}
                />

                <Input
                  label="Existing Monthly Loan EMIs (₹)"
                  type="number"
                  min={0}
                  value={formData.existing_monthly_obligations_inr}
                  onChange={(e) =>
                    handleFieldChange(
                      "existing_monthly_obligations_inr",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  error={errors.existing_monthly_obligations_inr}
                  helperText="Sum of home, auto, personal loan EMIs currently active."
                />

                <Input
                  label="Monthly Family Living Expenses (₹)"
                  type="number"
                  min={0}
                  value={formData.monthly_living_expenses_inr}
                  onChange={(e) =>
                    handleFieldChange(
                      "monthly_living_expenses_inr",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  error={errors.monthly_living_expenses_inr}
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Assets List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Family Assets & Net Worth</CardTitle>
                <CardDescription>
                  Tangible properties, bank deposits, and investment holdings.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAsset}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Asset
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {formData.assets.map((asset, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Asset Item #{index + 1}
                    </span>
                    {formData.assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Asset Type"
                      value={asset.asset_type}
                      onChange={(e) => updateAsset(index, "asset_type", e.target.value)}
                      options={Object.entries(ASSET_TYPE_LABELS).map(([val, lbl]) => ({
                        value: val,
                        label: lbl,
                      }))}
                    />

                    <Input
                      label="Estimated Market Value (₹)"
                      type="number"
                      min={0}
                      value={asset.estimated_value_inr}
                      onChange={(e) =>
                        updateAsset(index, "estimated_value_inr", parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Description / Location"
                      placeholder="e.g. 3BHK Apartment or HDFC Bank FD"
                      value={asset.description || ""}
                      onChange={(e) => updateAsset(index, "description", e.target.value)}
                    />

                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={asset.is_liquid}
                          onChange={(e) => updateAsset(index, "is_liquid", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0f382c] accent-[#0f382c]"
                        />
                        <span>Liquid Asset (Cash / Bank FD / Stocks)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3. Liabilities List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Existing Family Liabilities</CardTitle>
                <CardDescription>
                  Outstanding loans and ongoing debt obligations.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLiability}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Liability
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {formData.liabilities.map((liability, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Debt Item #{index + 1}
                    </span>
                    {formData.liabilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLiability(index)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select
                      label="Debt Type"
                      value={liability.liability_type}
                      onChange={(e) =>
                        updateLiability(index, "liability_type", e.target.value)
                      }
                      options={Object.entries(LIABILITY_TYPE_LABELS).map(([val, lbl]) => ({
                        value: val,
                        label: lbl,
                      }))}
                    />

                    <Input
                      label="Outstanding Amount (₹)"
                      type="number"
                      min={0}
                      value={liability.outstanding_amount_inr}
                      onChange={(e) =>
                        updateLiability(
                          index,
                          "outstanding_amount_inr",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />

                    <Input
                      label="Monthly EMI (₹)"
                      type="number"
                      min={0}
                      value={liability.monthly_emi_inr}
                      onChange={(e) =>
                        updateLiability(
                          index,
                          "monthly_emi_inr",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="justify-between">
              {onBack ? (
                <Button type="button" variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Funding
                </Button>
              ) : <div />}

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Save Financials & Proceed to Collateral
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live FOIR and Net Worth Receipt */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live Underwriting Metrics
              </h3>
            </div>

            {/* Income & Obligations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Monthly Income</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalMonthlyIncome)}/mo
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Existing Loan EMIs</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(formData.existing_monthly_obligations_inr)}/mo
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Estimated Edu Loan EMI</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(proposedLoanEmi)}/mo
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Monthly Debt Service</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalMonthlyObligations)}/mo
                </span>
              </div>
            </div>

            {/* FOIR Meter */}
            <div className="space-y-2">
              <ProgressBar
                value={foirPercent}
                label="Projected FOIR Ratio"
                showPercentage
                indicatorClassName={
                  foirPercent <= 50
                    ? "bg-emerald-600 dark:bg-emerald-400"
                    : foirPercent <= 65
                    ? "bg-amber-600 dark:bg-amber-400"
                    : "bg-rose-600 dark:bg-rose-400"
                }
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>0%</span>
                <span className="text-emerald-600 font-bold">50% (RBI Prime)</span>
                <span className="text-amber-600 font-bold">65% (NBFC Cap)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Net Worth Card */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Assets</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalAssetsValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Liabilities</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(totalLiabilitiesValue)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                  Family Net Worth
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {formatCurrency(netWorth)}
                </span>
              </div>
            </div>

            {/* Audit Advice Pill */}
            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 pt-1">
              {foirPercent <= 50 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>
                {foirPercent <= 50
                  ? "Co-borrower income easily supports requested loan. Eligible for premier public & NBFC rates."
                  : foirPercent <= 65
                  ? "FOIR is in the review/conditional zone. Pledging collateral will significantly increase approval chances."
                  : "FOIR exceeds 65% bank cap. Consider adding a second co-borrower or pledging property collateral."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
