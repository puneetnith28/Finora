"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  Check,
  AlertTriangle,
} from "lucide-react";
import { NeoBadge, NeoButton, NeoInput } from "@/components/ui/NeoPrimitives";
import {
  financialProfileSchema,
  type FinancialProfileFormData,
  type AssetItem,
  type LiabilityItem,
  ASSET_TYPE_LABELS,
  LIABILITY_TYPE_LABELS,
  FINANCIAL_PRESETS,
} from "@/lib/validations/financial_profile";
import { formatCurrency, formatPercent } from "@/lib/utils";

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
    assets:
      initialData?.assets && initialData.assets.length > 0
        ? initialData.assets
        : [
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
    liabilities:
      initialData?.liabilities && initialData.liabilities.length > 0
        ? initialData.liabilities
        : [
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

      const totalEmis = updated.reduce((acc, l) => acc + (Number(l.monthly_emi_inr) || 0), 0);
      return {
        ...prev,
        liabilities: updated,
        existing_monthly_obligations_inr:
          totalEmis > 0 ? totalEmis : prev.existing_monthly_obligations_inr,
      };
    });
  };

  // Live Deterministic Calculations
  const totalMonthlyIncome =
    (Number(formData.monthly_income_inr) || 0) + (Number(formData.other_income_inr) || 0);

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
      <div className="neo-box-yellow p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <NeoBadge variant="white" className="border-2 border-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CO-BORROWER PROFILES</span>
          </NeoBadge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FINANCIAL_PRESETS.map((preset) => (
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
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Co-borrower Income Section */}
          <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <NeoBadge variant="pink" rotate="left">
                  04 / FINANCIAL CAPACITY
                </NeoBadge>
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-1">
                  CO-BORROWER INCOME & CASH FLOW
                </h2>
              </div>
              <span className="text-xs font-black uppercase text-neutral-600">STEP 4 OF 6</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Co-Borrower Relationship
                </label>
                <select
                  value={formData.co_borrower_relationship}
                  onChange={(e) => handleFieldChange("co_borrower_relationship", e.target.value)}
                  className="neo-input"
                  required
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Brother / Sister</option>
                  <option value="self">Self (Working Professional)</option>
                  <option value="legal_guardian">Legal Guardian</option>
                </select>
              </div>

              <NeoInput
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
              />

              <NeoInput
                label="Primary Monthly Income (₹)"
                type="number"
                min={0}
                value={formData.monthly_income_inr}
                onChange={(e) =>
                  handleFieldChange("monthly_income_inr", parseFloat(e.target.value) || 0)
                }
                error={errors.monthly_income_inr}
                required
              />

              <NeoInput
                label="Other Monthly Income (₹)"
                type="number"
                min={0}
                value={formData.other_income_inr}
                onChange={(e) =>
                  handleFieldChange("other_income_inr", parseFloat(e.target.value) || 0)
                }
                error={errors.other_income_inr}
              />

              <NeoInput
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
              />

              <NeoInput
                label="Monthly Living Expenses (₹)"
                type="number"
                min={0}
                value={formData.monthly_living_expenses_inr}
                onChange={(e) =>
                  handleFieldChange("monthly_living_expenses_inr", parseFloat(e.target.value) || 0)
                }
                error={errors.monthly_living_expenses_inr}
              />
            </div>
          </div>

          {/* 2. Assets List */}
          <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b-2 border-black flex items-center justify-between">
              <div>
                <NeoBadge variant="cyan">ASSET HOLDINGS</NeoBadge>
                <h3 className="text-xl font-black text-black uppercase tracking-tight mt-1">
                  FAMILY ASSETS & WEALTH
                </h3>
              </div>
              <NeoButton type="button" variant="white" size="sm" onClick={addAsset}>
                <Plus className="h-4 w-4" />
                <span>ADD ASSET</span>
              </NeoButton>
            </div>

            <div className="space-y-4">
              {formData.assets.map((asset, index) => (
                <div key={index} className="neo-box p-4 bg-[#FAF8F5] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      ASSET ITEM #{index + 1}
                    </span>
                    {formData.assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="border-2 border-black bg-[#F472B6] p-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-black" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-black uppercase tracking-wider text-black">
                        Asset Type
                      </label>
                      <select
                        value={asset.asset_type}
                        onChange={(e) => updateAsset(index, "asset_type", e.target.value)}
                        className="neo-input"
                      >
                        {Object.entries(ASSET_TYPE_LABELS).map(([val, lbl]) => (
                          <option key={val} value={val}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <NeoInput
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
                    <NeoInput
                      label="Description / Details"
                      placeholder="e.g. 3BHK Apartment or Bank Fixed Deposit"
                      value={asset.description || ""}
                      onChange={(e) => updateAsset(index, "description", e.target.value)}
                    />

                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 text-xs font-black text-black uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={asset.is_liquid}
                          onChange={(e) => updateAsset(index, "is_liquid", e.target.checked)}
                          className="h-4 w-4 border-2 border-black accent-black cursor-pointer"
                        />
                        <span>Liquid Asset (Cash / Bank FD)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Liabilities List */}
          <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b-2 border-black flex items-center justify-between">
              <div>
                <NeoBadge variant="pink">DEBT REGISTER</NeoBadge>
                <h3 className="text-xl font-black text-black uppercase tracking-tight mt-1">
                  EXISTING FAMILY LIABILITIES
                </h3>
              </div>
              <NeoButton type="button" variant="white" size="sm" onClick={addLiability}>
                <Plus className="h-4 w-4" />
                <span>ADD DEBT</span>
              </NeoButton>
            </div>

            <div className="space-y-4">
              {formData.liabilities.map((liability, index) => (
                <div key={index} className="neo-box p-4 bg-[#FAF8F5] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      DEBT ITEM #{index + 1}
                    </span>
                    {formData.liabilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLiability(index)}
                        className="border-2 border-black bg-[#F472B6] p-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-black" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-black uppercase tracking-wider text-black">
                        Debt Type
                      </label>
                      <select
                        value={liability.liability_type}
                        onChange={(e) => updateLiability(index, "liability_type", e.target.value)}
                        className="neo-input"
                      >
                        {Object.entries(LIABILITY_TYPE_LABELS).map(([val, lbl]) => (
                          <option key={val} value={val}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <NeoInput
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

                    <NeoInput
                      label="Monthly EMI (₹)"
                      type="number"
                      min={0}
                      value={liability.monthly_emi_inr}
                      onChange={(e) =>
                        updateLiability(index, "monthly_emi_inr", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              ))}
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
                  <span>BACK TO FUNDING</span>
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
                <span>{isLoading ? "SAVING..." : "SAVE & PROCEED TO COLLATERAL"}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </NeoButton>
            </div>
          </div>
        </div>

        {/* Right Column: Live FOIR and Net Worth Receipt */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 neo-box-lg bg-white p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
              <Building className="h-4 w-4 text-black" />
              <h3 className="font-black text-black uppercase tracking-tight text-sm">
                LIVE UNDERWRITING METRICS
              </h3>
            </div>

            {/* Income & Obligations */}
            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Gross Monthly Income</span>
                <span className="font-mono text-black">
                  {formatCurrency(totalMonthlyIncome)}/mo
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Existing Loan EMIs</span>
                <span className="font-mono text-black">
                  {formatCurrency(formData.existing_monthly_obligations_inr)}/mo
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Estimated Edu Loan EMI</span>
                <span className="font-mono text-black">{formatCurrency(proposedLoanEmi)}/mo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Total Debt Service</span>
                <span className="font-mono text-black">
                  {formatCurrency(totalMonthlyObligations)}/mo
                </span>
              </div>
            </div>

            {/* FOIR Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black uppercase">
                <span>PROJECTED FOIR</span>
                <span className="font-mono">{formatPercent(foirPercent)}</span>
              </div>
              <div className="w-full h-3 border-2 border-black bg-white overflow-hidden">
                <div
                  className={`h-full border-r-2 border-black ${
                    foirPercent <= 50
                      ? "bg-[#86EFAC]"
                      : foirPercent <= 65
                        ? "bg-[#FEF08A]"
                        : "bg-[#F472B6]"
                  }`}
                  style={{ width: `${Math.min(100, foirPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono font-black text-neutral-600 pt-0.5">
                <span>0%</span>
                <span className="text-black font-bold">50% PRIME</span>
                <span className="text-black font-bold">65% CAP</span>
                <span>100%</span>
              </div>
            </div>

            {/* Net Worth Box */}
            <div className="neo-box p-3.5 bg-[#FAF8F5] space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Assets</span>
                <span className="font-mono text-black">{formatCurrency(totalAssetsValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Liabilities</span>
                <span className="font-mono text-neutral-800">
                  {formatCurrency(totalLiabilitiesValue)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t-2 border-black">
                <span className="font-black uppercase text-[11px]">Net Worth</span>
                <span className="font-mono font-black text-black">{formatCurrency(netWorth)}</span>
              </div>
            </div>

            {/* Status Advice Box */}
            <div
              className={`p-3 border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_#000000] ${
                foirPercent <= 50
                  ? "bg-[#86EFAC]"
                  : foirPercent <= 65
                    ? "bg-[#FEF08A]"
                    : "bg-[#F472B6]"
              }`}
            >
              <div className="flex items-center gap-1 font-black text-black uppercase mb-1">
                {foirPercent <= 50 ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 stroke-[3]" />
                )}
                <span>
                  {foirPercent <= 50
                    ? "PRIME FOIR HEALTH"
                    : foirPercent <= 65
                      ? "CONDITIONAL STRESS"
                      : "HIGH DEBT STRESS"}
                </span>
              </div>
              {foirPercent <= 50
                ? "Co-borrower income easily backs proposed loan. Eligible for prime public bank slabs."
                : foirPercent <= 65
                  ? "FOIR in review zone. Pledging property collateral will boost approval."
                  : "FOIR exceeds 65% bank cap. Consider adding collateral or second co-signer."}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
