"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  PieChart,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/StatCard";
import { 
  type FundingSourceItem, 
  FUNDING_SOURCE_LABELS, 
  FUNDING_PRESETS,
  fundingListSchema 
} from "@/lib/validations/funding";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface FundingFormProps {
  totalCostInr: number;
  initialSources?: FundingSourceItem[];
  onSubmit: (sources: FundingSourceItem[]) => Promise<void> | void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function FundingForm({
  totalCostInr,
  initialSources,
  onSubmit,
  onBack,
  isLoading = false,
}: FundingFormProps) {
  const [sources, setSources] = useState<FundingSourceItem[]>(
    initialSources && initialSources.length > 0
      ? initialSources
      : [
          {
            source_type: "savings",
            amount_original: 1000000,
            currency: "INR",
            exchange_rate_to_inr: 1.0,
            description: "Personal & family liquid savings",
            verified: true,
          },
        ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyPreset = (presetId: string) => {
    const preset = FUNDING_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSources(preset.sources);
      setErrors({});
    }
  };

  const addSource = () => {
    setSources((prev) => [
      ...prev,
      {
        source_type: "savings",
        amount_original: 500000,
        currency: "INR",
        exchange_rate_to_inr: 1.0,
        description: "",
        verified: true,
      },
    ]);
  };

  const removeSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSource = (
    index: number,
    field: keyof FundingSourceItem,
    value: unknown
  ) => {
    setSources((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Live Deterministic Sums
  const totalAvailableFundingInr = sources.reduce((acc, src) => {
    const orig = Number(src.amount_original) || 0;
    const rate = Number(src.exchange_rate_to_inr) || 1.0;
    return acc + orig * rate;
  }, 0);

  const fundingGapInr = Math.max(0, totalCostInr - totalAvailableFundingInr);
  const fundedRatio = totalCostInr > 0 ? (totalAvailableFundingInr / totalCostInr) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = fundingListSchema.safeParse({ sources });
    if (!result.success) {
      setErrors({ form: "Please review the entered funding values." });
      return;
    }
    await onSubmit(sources);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preset Quick Loader */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Self-Funding Scenarios
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FUNDING_PRESETS.map((preset) => (
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
        {/* Left Column: Funding Sources List */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>3. Available Funding & Self-Contribution</CardTitle>
                <CardDescription>
                  List all non-loan financial sources (savings, family support, scholarships, fixed deposits).
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSource}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Source
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Funding Item #{index + 1}
                    </span>
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remove source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select
                      label="Source Type"
                      value={source.source_type}
                      onChange={(e) => updateSource(index, "source_type", e.target.value)}
                      options={Object.entries(FUNDING_SOURCE_LABELS).map(([val, lbl]) => ({
                        value: val,
                        label: lbl,
                      }))}
                    />

                    <Input
                      label="Original Amount"
                      type="number"
                      min={0}
                      value={source.amount_original}
                      onChange={(e) =>
                        updateSource(index, "amount_original", parseFloat(e.target.value) || 0)
                      }
                      required
                    />

                    <Select
                      label="Currency"
                      value={source.currency}
                      onChange={(e) => {
                        const curr = e.target.value;
                        const rate =
                          curr === "USD" ? 84.5 : curr === "EUR" ? 92.0 : curr === "GBP" ? 107.5 : 1.0;
                        updateSource(index, "currency", curr);
                        updateSource(index, "exchange_rate_to_inr", rate);
                      }}
                      options={[
                        { value: "INR", label: "INR (₹)" },
                        { value: "USD", label: "USD ($)" },
                        { value: "EUR", label: "EUR (€)" },
                        { value: "GBP", label: "GBP (£)" },
                        { value: "CAD", label: "CAD ($)" },
                        { value: "AUD", label: "AUD ($)" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Description / Bank Name"
                      placeholder="e.g. HDFC Savings A/c or Merit Scholarship"
                      value={source.description || ""}
                      onChange={(e) => updateSource(index, "description", e.target.value)}
                    />

                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={source.verified}
                          onChange={(e) => updateSource(index, "verified", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0f382c] accent-[#0f382c]"
                        />
                        <span>Verified with Proof (e.g. Statement / Award)</span>
                      </label>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    INR Value: {formatCurrency(Number(source.amount_original || 0) * Number(source.exchange_rate_to_inr || 1.0))}
                  </div>
                </div>
              ))}

              {errors.form && <p className="text-xs text-rose-600">{errors.form}</p>}
            </CardContent>

            <CardFooter className="justify-between">
              {onBack ? (
                <Button type="button" variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Study Plan
                </Button>
              ) : <div />}

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Save Funding & Proceed to Financials
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Funding Gap Analysis */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Funding Gap Analysis
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Program Cost</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalCostInr)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Available Self-Funding</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalAvailableFundingInr)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Self-Funded Ratio</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatPercent(fundedRatio)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <ProgressBar
                value={fundedRatio}
                label="Self-Funding Coverage"
                showPercentage
                indicatorClassName={
                  fundedRatio >= 50
                    ? "bg-emerald-600 dark:bg-emerald-400"
                    : fundedRatio >= 20
                    ? "bg-blue-600 dark:bg-blue-400"
                    : "bg-amber-600 dark:bg-amber-400"
                }
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#0f382c] text-white dark:bg-emerald-950 dark:border dark:border-emerald-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                Net Required Education Loan (Gap)
              </span>
              <span className="text-2xl font-extrabold font-mono text-white dark:text-emerald-300">
                {formatCurrency(fundingGapInr)}
              </span>
              <span className="text-[11px] text-emerald-200/70 block pt-1">
                {fundingGapInr === 0
                  ? "Fully self-funded. No loan needed."
                  : `Target loan amount to be evaluated across lenders.`}
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-start gap-2">
              {fundingGapInr > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              )}
              <span>
                {fundingGapInr > 0
                  ? "This gap will be stress-tested for co-borrower FOIR and collateral requirements in the next steps."
                  : "All program expenses are covered by verified self-funding."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
