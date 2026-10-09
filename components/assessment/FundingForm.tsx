"use client";

import React, { useState } from "react";
import { Plus, Trash2, Sparkles, ArrowUpRight, ArrowLeft, PieChart, Check } from "lucide-react";
import { NeoBadge, NeoButton, NeoInput } from "@/components/ui/NeoPrimitives";
import {
  type FundingSourceItem,
  FUNDING_SOURCE_LABELS,
  FUNDING_PRESETS,
  fundingListSchema,
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

  const updateSource = (index: number, field: keyof FundingSourceItem, value: unknown) => {
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
      <div className="neo-box-yellow p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <NeoBadge variant="white" className="border-2 border-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SELF-FUNDING BENCHMARKS</span>
          </NeoBadge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FUNDING_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 border-2 border-black bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer group"
            >
              <div className="font-black text-xs text-black uppercase">{preset.name}</div>
              <div className="text-[11px] font-bold text-neutral-600 truncate mt-0.5">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Funding Sources List */}
        <div className="lg:col-span-8">
          <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <NeoBadge variant="mint" rotate="left">
                  03 / LIQUID FUNDING
                </NeoBadge>
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-1">
                  AVAILABLE FUNDING & CONTRIBUTIONS
                </h2>
              </div>
              <NeoButton type="button" variant="white" size="sm" onClick={addSource}>
                <Plus className="h-4 w-4" />
                <span>ADD SOURCE</span>
              </NeoButton>
            </div>

            <div className="space-y-4">
              {sources.map((source, index) => (
                <div key={index} className="neo-box p-4 bg-[#FAF8F5] space-y-3 relative group">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      FUNDING ITEM #{index + 1}
                    </span>
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="border-2 border-black bg-[#F472B6] p-1 hover:bg-pink-400 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Remove source"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-black" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-black uppercase tracking-wider text-black">
                        Source Type
                      </label>
                      <select
                        value={source.source_type}
                        onChange={(e) => updateSource(index, "source_type", e.target.value)}
                        className="neo-input"
                      >
                        {Object.entries(FUNDING_SOURCE_LABELS).map(([val, lbl]) => (
                          <option key={val} value={val}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <NeoInput
                      label="Original Amount"
                      type="number"
                      min={0}
                      value={source.amount_original}
                      onChange={(e) =>
                        updateSource(index, "amount_original", parseFloat(e.target.value) || 0)
                      }
                      required
                    />

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-black uppercase tracking-wider text-black">
                        Currency
                      </label>
                      <select
                        value={source.currency}
                        onChange={(e) => {
                          const curr = e.target.value;
                          const rate =
                            curr === "USD"
                              ? 84.5
                              : curr === "EUR"
                                ? 92.0
                                : curr === "GBP"
                                  ? 107.5
                                  : 1.0;
                          updateSource(index, "currency", curr);
                          updateSource(index, "exchange_rate_to_inr", rate);
                        }}
                        className="neo-input"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <NeoInput
                      label="Description / Bank"
                      placeholder="e.g. HDFC Savings A/c or Merit Scholarship"
                      value={source.description || ""}
                      onChange={(e) => updateSource(index, "description", e.target.value)}
                    />

                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 text-xs font-black text-black uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={source.verified}
                          onChange={(e) => updateSource(index, "verified", e.target.checked)}
                          className="h-4 w-4 border-2 border-black accent-black cursor-pointer"
                        />
                        <span>Verified with Proof</span>
                      </label>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono font-black text-black">
                    INR VALUE:{" "}
                    {formatCurrency(
                      Number(source.amount_original || 0) *
                        Number(source.exchange_rate_to_inr || 1.0)
                    )}
                  </div>
                </div>
              ))}

              {errors.form && (
                <p className="text-xs font-black text-red-600 bg-red-100 p-2 border-2 border-red-600">
                  {errors.form}
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t-2 border-black flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              {onBack ? (
                <NeoButton
                  type="button"
                  variant="white"
                  onClick={onBack}
                  className="w-full sm:w-auto justify-center"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>BACK TO COSTS</span>
                </NeoButton>
              ) : (
                <div />
              )}

              <NeoButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full sm:w-auto justify-center"
              >
                <span>{isLoading ? "SAVING..." : "SAVE & PROCEED TO FINANCIALS"}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </NeoButton>
            </div>
          </div>
        </div>

        {/* Right Column: Live Funding Gap Analysis */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 neo-box-lg bg-white p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
              <PieChart className="h-4 w-4 text-black" />
              <h3 className="font-black text-black uppercase tracking-tight text-sm">
                FUNDING GAP ANALYSIS
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Total Program Cost</span>
                <span className="font-mono text-black">{formatCurrency(totalCostInr)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Available Self-Funding</span>
                <span className="font-mono text-black">
                  {formatCurrency(totalAvailableFundingInr)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Self-Funded Ratio</span>
                <span className="font-mono text-black">{formatPercent(fundedRatio)}</span>
              </div>
            </div>

            {/* Progress Box */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-black uppercase">
                <span>COVERAGE</span>
                <span>{formatPercent(fundedRatio)}</span>
              </div>
              <div className="w-full h-3 border-2 border-black bg-white overflow-hidden">
                <div
                  className="h-full bg-[#86EFAC] border-r-2 border-black"
                  style={{ width: `${Math.min(100, fundedRatio)}%` }}
                />
              </div>
            </div>

            {/* Required Gap Banner */}
            <div className="neo-box-black p-4 space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#FEF08A] block">
                REQUIRED EDUCATION LOAN (GAP)
              </span>
              <span className="text-2xl font-black font-mono text-white block">
                {formatCurrency(fundingGapInr)}
              </span>
              <span className="text-[10px] font-bold text-neutral-300 block pt-1">
                {fundingGapInr === 0
                  ? "Fully self-funded. No loan needed."
                  : "Target loan amount to be evaluated across lenders."}
              </span>
            </div>

            <div className="p-2.5 bg-[#FEF08A] border-2 border-black text-[11px] font-bold text-neutral-900 shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center gap-1 font-black text-black uppercase mb-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>UNDERWRITING NOTICE</span>
              </div>
              This gap will be stress-tested for co-borrower FOIR and collateral requirements.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
