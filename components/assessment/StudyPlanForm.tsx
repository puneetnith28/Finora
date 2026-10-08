"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Sparkles, 
  ArrowUpRight, 
  ArrowLeft,
  Coins
} from "lucide-react";
import { NeoBadge, NeoButton, NeoInput } from "@/components/ui/NeoPrimitives";
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
      <div className="neo-box-yellow p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <NeoBadge variant="white" className="border-2 border-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>DESTINATION BUDGET BENCHMARKS</span>
          </NeoBadge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STUDY_PLAN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 border-2 border-black bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer group"
            >
              <div className="font-black text-xs text-black uppercase">
                {preset.title}
              </div>
              <div className="text-[11px] font-bold text-neutral-600 truncate mt-0.5">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Inputs */}
        <div className="lg:col-span-8">
          <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <NeoBadge variant="cyan" rotate="left">
                  02 / STUDY COSTS
                </NeoBadge>
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-1">
                  STUDY PLAN & COST PARAMETERS
                </h2>
              </div>
              <span className="text-xs font-black uppercase text-neutral-600">
                STEP 2 OF 6
              </span>
            </div>

            {/* Currency & Exchange Rate Bar */}
            <div className="neo-box-cyan p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Program Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="neo-input"
                >
                  <option value="USD">USD ($) — United States</option>
                  <option value="EUR">EUR (€) — Germany / Eurozone</option>
                  <option value="GBP">GBP (£) — United Kingdom</option>
                  <option value="CAD">CAD ($) — Canada</option>
                  <option value="AUD">AUD ($) — Australia</option>
                  <option value="SGD">SGD ($) — Singapore</option>
                  <option value="INR">INR (₹) — India</option>
                </select>
              </div>

              <NeoInput
                label="Exchange Rate to INR"
                type="number"
                step="0.01"
                value={formData.exchange_rate_to_inr}
                onChange={(e) => handleChange("exchange_rate_to_inr", parseFloat(e.target.value) || 0)}
                error={errors.exchange_rate_to_inr}
              />

              <NeoInput
                label="Duration (Months)"
                type="number"
                min={1}
                max={72}
                value={formData.duration_months}
                onChange={(e) => handleChange("duration_months", parseInt(e.target.value, 10) || 12)}
                error={errors.duration_months}
              />
            </div>

            {/* Expense Breakdown */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                DIRECT EXPENSES ({formData.currency})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeoInput
                  label={`Tuition Fees (${formData.currency})`}
                  type="number"
                  min={0}
                  value={formData.tuition_fees_original}
                  onChange={(e) => handleChange("tuition_fees_original", parseFloat(e.target.value) || 0)}
                  error={errors.tuition_fees_original}
                  required
                />

                <NeoInput
                  label={`Living & Accommodation (${formData.currency})`}
                  type="number"
                  min={0}
                  value={formData.living_expenses_original}
                  onChange={(e) => handleChange("living_expenses_original", parseFloat(e.target.value) || 0)}
                  error={errors.living_expenses_original}
                  required
                />

                <NeoInput
                  label={`Travel & Airfare (${formData.currency})`}
                  type="number"
                  min={0}
                  value={formData.travel_expenses_original}
                  onChange={(e) => handleChange("travel_expenses_original", parseFloat(e.target.value) || 0)}
                  error={errors.travel_expenses_original}
                />

                <NeoInput
                  label={`Health Insurance (${formData.currency})`}
                  type="number"
                  min={0}
                  value={formData.insurance_original}
                  onChange={(e) => handleChange("insurance_original", parseFloat(e.target.value) || 0)}
                  error={errors.insurance_original}
                />

                <NeoInput
                  label={`Visa & SEVIS Fees (${formData.currency})`}
                  type="number"
                  min={0}
                  value={formData.visa_fees_original}
                  onChange={(e) => handleChange("visa_fees_original", parseFloat(e.target.value) || 0)}
                  error={errors.visa_fees_original}
                />

                <NeoInput
                  label={`Books & Misc (${formData.currency})`}
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
              <NeoInput
                label="Annual Inflation Buffer (%)"
                type="number"
                step="0.5"
                min={0}
                max={25}
                value={formData.inflation_rate_percent}
                onChange={(e) => handleChange("inflation_rate_percent", parseFloat(e.target.value) || 0)}
                error={errors.inflation_rate_percent}
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t-2 border-black flex items-center justify-between">
              {onBack ? (
                <NeoButton type="button" variant="white" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>BACK TO PROFILE</span>
                </NeoButton>
              ) : <div />}

              <NeoButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
              >
                <span>{isLoading ? "SAVING..." : "SAVE & PROCEED TO FUNDING"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </NeoButton>
            </div>
          </div>
        </div>

        {/* Right Col: Live Cost Summary Receipt */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 neo-box-lg bg-white p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
              <Calculator className="h-4 w-4 text-black" />
              <h3 className="font-black text-black uppercase tracking-tight text-sm">
                LIVE STUDY COST RECEIPT
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Tuition</span>
                <span className="font-mono text-black">
                  {formData.currency} {Number(formData.tuition_fees_original || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Living Expenses</span>
                <span className="font-mono text-black">
                  {formData.currency} {Number(formData.living_expenses_original || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Travel, Visa & Misc</span>
                <span className="font-mono text-black">
                  {formData.currency} {(
                    Number(formData.travel_expenses_original || 0) +
                    Number(formData.insurance_original || 0) +
                    Number(formData.visa_fees_original || 0) +
                    Number(formData.miscellaneous_original || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">FX Conversion Rate</span>
                <span className="font-mono text-black">
                  1 {formData.currency} = ₹{formData.exchange_rate_to_inr}
                </span>
              </div>
            </div>

            <div className="neo-box-black p-4 space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#FEF08A] block">
                TOTAL NORMALIZED BUDGET (INR)
              </span>
              <span className="text-2xl font-black font-mono text-white block">
                {formatCurrency(totalInr)}
              </span>
              <span className="text-[10px] font-bold text-neutral-300 block pt-1">
                Includes {formData.duration_months} mo duration & {formData.inflation_rate_percent}% inflation
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
