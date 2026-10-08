"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Plane,
  Shield,
  FileCheck,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { 
  studyPlanSchema, 
  type StudyPlanFormData, 
  DEFAULT_EXCHANGE_RATES, 
  STUDY_PLAN_PRESETS 
} from "@/lib/validations/study_plan";
import { formatCurrency } from "@/lib/utils";

export interface StudyPlanFormProps {
  initialData?: Partial<StudyPlanFormData>;
  onSubmit: (data: StudyPlanFormData) => Promise<void> | void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function StudyPlanForm({
  initialData,
  onSubmit,
  onBack,
  isLoading = false,
}: StudyPlanFormProps) {
  const [formData, setFormData] = useState<StudyPlanFormData>({
    tuition_fees_original: initialData?.tuition_fees_original ?? 50000,
    living_expenses_original: initialData?.living_expenses_original ?? 20000,
    travel_expenses_original: initialData?.travel_expenses_original ?? 2000,
    insurance_original: initialData?.insurance_original ?? 2500,
    visa_fees_original: initialData?.visa_fees_original ?? 500,
    miscellaneous_original: initialData?.miscellaneous_original ?? 1000,
    currency: initialData?.currency || "USD",
    duration_months: initialData?.duration_months ?? 24,
    inflation_rate_percent: initialData?.inflation_rate_percent ?? 5.0,
    exchange_rate_to_inr:
      initialData?.exchange_rate_to_inr ??
      DEFAULT_EXCHANGE_RATES[initialData?.currency || "USD"] ??
      84.5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyPreset = (presetId: string) => {
    const preset = STUDY_PLAN_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormData(preset.data);
      setErrors({});
    }
  };

  const handleCurrencyChange = (curr: string) => {
    const defaultRate = DEFAULT_EXCHANGE_RATES[curr] || 1.0;
    setFormData((prev) => ({
      ...prev,
      currency: curr,
      exchange_rate_to_inr: defaultRate,
    }));
  };

  const handleChange = (field: keyof StudyPlanFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Live Deterministic Calculations
  const totalOriginalBase =
    Number(formData.tuition_fees_original || 0) +
    Number(formData.living_expenses_original || 0) +
    Number(formData.travel_expenses_original || 0) +
    Number(formData.insurance_original || 0) +
    Number(formData.visa_fees_original || 0) +
    Number(formData.miscellaneous_original || 0);

  const durationYears = (formData.duration_months || 24) / 12;
  const inflationMultiplier =
    durationYears > 1
      ? Math.pow(1 + (Number(formData.inflation_rate_percent) || 0) / 100, durationYears - 1)
      : 1.0;

  const totalOriginalWithInflation = totalOriginalBase * (durationYears > 1 ? (1 + inflationMultiplier) / 2 : 1.0);
  const totalInr = totalOriginalWithInflation * (Number(formData.exchange_rate_to_inr) || 1.0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = studyPlanSchema.safeParse(formData);
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
      {/* Preset Quick Loaders */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Target Destination Budget Benchmarks
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STUDY_PLAN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 hover:shadow-sm transition-all text-xs group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {preset.title}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Inputs */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>2. Study Plan & Cost Parameters</CardTitle>
              <CardDescription>
                Define your international tuition, living costs, and duration. All amounts are automatically normalized to INR.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Currency & Exchange Rate Bar */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Program Currency"
                  value={formData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  options={[
                    { value: "USD", label: "USD ($) — United States" },
                    { value: "EUR", label: "EUR (€) — Eurozone / Germany" },
                    { value: "GBP", label: "GBP (£) — United Kingdom" },
                    { value: "CAD", label: "CAD ($) — Canada" },
                    { value: "AUD", label: "AUD ($) — Australia" },
                    { value: "SGD", label: "SGD ($) — Singapore" },
                    { value: "INR", label: "INR (₹) — India" },
                  ]}
                />

                <Input
                  label="Exchange Rate to INR"
                  type="number"
                  step="0.01"
                  value={formData.exchange_rate_to_inr}
                  onChange={(e) => handleChange("exchange_rate_to_inr", parseFloat(e.target.value) || 0)}
                  error={errors.exchange_rate_to_inr}
                  leftIcon={<Coins className="h-4 w-4" />}
                />

                <Input
                  label="Duration (Months)"
                  type="number"
                  min={1}
                  max={72}
                  value={formData.duration_months}
                  onChange={(e) => handleChange("duration_months", parseInt(e.target.value, 10) || 12)}
                  error={errors.duration_months}
                  helperText={`${((formData.duration_months || 24) / 12).toFixed(1)} academic years`}
                />
              </div>

              {/* Expense Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Direct Program Expenses ({formData.currency})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`Tuition Fees (${formData.currency})`}
                    type="number"
                    min={0}
                    value={formData.tuition_fees_original}
                    onChange={(e) => handleChange("tuition_fees_original", parseFloat(e.target.value) || 0)}
                    error={errors.tuition_fees_original}
                    required
                  />

                  <Input
                    label={`Living & Accommodation (${formData.currency})`}
                    type="number"
                    min={0}
                    value={formData.living_expenses_original}
                    onChange={(e) => handleChange("living_expenses_original", parseFloat(e.target.value) || 0)}
                    error={errors.living_expenses_original}
                    required
                  />

                  <Input
                    label={`Travel & Airfare (${formData.currency})`}
                    type="number"
                    min={0}
                    value={formData.travel_expenses_original}
                    onChange={(e) => handleChange("travel_expenses_original", parseFloat(e.target.value) || 0)}
                    error={errors.travel_expenses_original}
                    leftIcon={<Plane className="h-4 w-4" />}
                  />

                  <Input
                    label={`Health Insurance (${formData.currency})`}
                    type="number"
                    min={0}
                    value={formData.insurance_original}
                    onChange={(e) => handleChange("insurance_original", parseFloat(e.target.value) || 0)}
                    error={errors.insurance_original}
                    leftIcon={<Shield className="h-4 w-4" />}
                  />

                  <Input
                    label={`Visa & SEVIS Fees (${formData.currency})`}
                    type="number"
                    min={0}
                    value={formData.visa_fees_original}
                    onChange={(e) => handleChange("visa_fees_original", parseFloat(e.target.value) || 0)}
                    error={errors.visa_fees_original}
                    leftIcon={<FileCheck className="h-4 w-4" />}
                  />

                  <Input
                    label={`Books & Tech Misc (${formData.currency})`}
                    type="number"
                    min={0}
                    value={formData.miscellaneous_original}
                    onChange={(e) => handleChange("miscellaneous_original", parseFloat(e.target.value) || 0)}
                    error={errors.miscellaneous_original}
                  />
                </div>
              </div>

              {/* Annual Inflation Buffer */}
              <div className="pt-2">
                <Input
                  label="Annual Living & Tuition Inflation Buffer (%)"
                  type="number"
                  step="0.5"
                  min={0}
                  max={25}
                  value={formData.inflation_rate_percent}
                  onChange={(e) => handleChange("inflation_rate_percent", parseFloat(e.target.value) || 0)}
                  error={errors.inflation_rate_percent}
                  helperText="Recommended 3-5% for multi-year programs to protect against foreign cost-of-living rises."
                />
              </div>
            </CardContent>

            <CardFooter className="justify-between">
              {onBack ? (
                <Button type="button" variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Profile
                </Button>
              ) : <div />}

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Save Costs & Proceed to Funding
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Col: Live Cost Summary Receipt */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live Study Cost Receipt
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tuition</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formData.currency} {Number(formData.tuition_fees_original || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Living Expenses</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formData.currency} {Number(formData.living_expenses_original || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Travel, Visa & Misc</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formData.currency} {(
                    Number(formData.travel_expenses_original || 0) +
                    Number(formData.insurance_original || 0) +
                    Number(formData.visa_fees_original || 0) +
                    Number(formData.miscellaneous_original || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">FX Conversion Rate</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  1 {formData.currency} = ₹{formData.exchange_rate_to_inr}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f382c] text-white dark:bg-emerald-950 dark:border dark:border-emerald-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                Total Normalized Budget (INR)
              </span>
              <span className="text-2xl font-extrabold font-mono text-white dark:text-emerald-300">
                {formatCurrency(totalInr)}
              </span>
              <span className="text-[11px] text-emerald-200/70 block pt-1">
                Includes {formData.duration_months} mo duration & {formData.inflation_rate_percent}% inflation buffer
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
