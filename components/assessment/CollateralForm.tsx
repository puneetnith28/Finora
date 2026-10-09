"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Trash2,
  Shield,
  ShieldAlert,
  Building,
  Check,
} from "lucide-react";
import { NeoBadge, NeoButton, NeoInput } from "@/components/ui/NeoPrimitives";
import {
  collateralListSchema,
  type CollateralItem,
  COLLATERAL_HAIRCUTS,
  COLLATERAL_TYPE_LABELS,
  OWNERSHIP_STATUS_LABELS,
  COLLATERAL_PRESETS,
} from "@/lib/validations/collateral";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface CollateralFormProps {
  requestedLoanInr: number;
  initialCollaterals?: CollateralItem[];
  onSubmit: (collaterals: CollateralItem[]) => Promise<void> | void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function CollateralForm({
  requestedLoanInr,
  initialCollaterals,
  onSubmit,
  onBack,
  isLoading = false,
}: CollateralFormProps) {
  const [collaterals, setCollaterals] = useState<CollateralItem[]>(
    initialCollaterals !== undefined
      ? initialCollaterals
      : [
          {
            collateral_type: "residential_property",
            ownership_status: "co_owned_parents",
            market_value_inr: 7500000,
            existing_encumbrance_inr: 0,
            property_city: "Bangalore",
            property_state: "Karnataka",
            title_clear: true,
            valuation_report_available: true,
            description: "Parental residential apartment",
          },
        ]
  );

  const applyPreset = (presetId: string) => {
    const preset = COLLATERAL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCollaterals(preset.collaterals);
    }
  };

  const addCollateral = () => {
    setCollaterals((prev) => [
      ...prev,
      {
        collateral_type: "residential_property",
        ownership_status: "sole_owner",
        market_value_inr: 5000000,
        existing_encumbrance_inr: 0,
        property_city: "",
        property_state: "",
        title_clear: true,
        valuation_report_available: false,
        description: "",
      },
    ]);
  };

  const removeCollateral = (index: number) => {
    setCollaterals((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCollateral = (index: number, field: keyof CollateralItem, value: unknown) => {
    setCollaterals((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Live Deterministic Sums
  const totalMarketValueInr = collaterals.reduce(
    (acc, c) => acc + (Number(c.market_value_inr) || 0),
    0
  );

  const totalEncumbranceInr = collaterals.reduce(
    (acc, c) => acc + (Number(c.existing_encumbrance_inr) || 0),
    0
  );

  const totalEligibleValueInr = collaterals.reduce((acc, c) => {
    const mkt = Number(c.market_value_inr) || 0;
    const enc = Number(c.existing_encumbrance_inr) || 0;
    const haircut = COLLATERAL_HAIRCUTS[c.collateral_type] || 0.8;
    const eligible = Math.max(0, mkt * haircut - enc);
    return acc + eligible;
  }, 0);

  const ltvPercent =
    totalEligibleValueInr > 0 ? (requestedLoanInr / totalEligibleValueInr) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = collateralListSchema.safeParse({ collaterals });
    if (!result.success) {
      return;
    }
    await onSubmit(collaterals);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preset Quick Loader */}
      <div className="neo-box-yellow p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <NeoBadge variant="white" className="border-2 border-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>COLLATERAL SECURITY PRESETS</span>
          </NeoBadge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COLLATERAL_PRESETS.map((preset) => (
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
        {/* Left Column: Collateral Form */}
        <div className="lg:col-span-8">
          <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <NeoBadge variant="mint" rotate="left">
                  05 / SECURITY PLEDGE
                </NeoBadge>
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-1">
                  PLEDGED COLLATERAL & SECURITY
                </h2>
              </div>
              <NeoButton type="button" variant="white" size="sm" onClick={addCollateral}>
                <Plus className="h-4 w-4" />
                <span>ADD PLEDGE</span>
              </NeoButton>
            </div>

            <div className="space-y-4">
              {collaterals.length === 0 ? (
                <div className="neo-box-cyan p-6 text-center space-y-3">
                  <ShieldAlert className="h-8 w-8 text-black mx-auto" />
                  <div>
                    <h4 className="font-black text-black uppercase text-sm">
                      NO COLLATERAL PLEDGED (UNSECURED MODE)
                    </h4>
                    <p className="text-xs font-bold text-neutral-800 max-w-md mx-auto mt-1">
                      Evaluating collateral-free loan slabs. Lenders like Prodigy Finance and Avanse
                      Unsecured will be evaluated on candidate merit.
                    </p>
                  </div>
                  <NeoButton type="button" variant="white" size="sm" onClick={addCollateral}>
                    <Plus className="h-4 w-4" />
                    <span>ADD PROPERTY OR FIXED DEPOSIT</span>
                  </NeoButton>
                </div>
              ) : (
                collaterals.map((collateral, index) => {
                  const haircut = COLLATERAL_HAIRCUTS[collateral.collateral_type] || 0.8;
                  const itemEligible = Math.max(
                    0,
                    (Number(collateral.market_value_inr) || 0) * haircut -
                      (Number(collateral.existing_encumbrance_inr) || 0)
                  );

                  return (
                    <div key={index} className="neo-box p-4 bg-[#FAF8F5] space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-black" />
                          <span className="text-xs font-black uppercase tracking-wider text-black">
                            SECURITY ASSET #{index + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCollateral(index)}
                          className="border-2 border-black bg-[#F472B6] p-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-black" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-black uppercase tracking-wider text-black">
                            Collateral Type
                          </label>
                          <select
                            value={collateral.collateral_type}
                            onChange={(e) =>
                              updateCollateral(index, "collateral_type", e.target.value)
                            }
                            className="neo-input"
                          >
                            {Object.entries(COLLATERAL_TYPE_LABELS).map(([val, lbl]) => (
                              <option key={val} value={val}>
                                {lbl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-black uppercase tracking-wider text-black">
                            Ownership Status
                          </label>
                          <select
                            value={collateral.ownership_status}
                            onChange={(e) =>
                              updateCollateral(index, "ownership_status", e.target.value)
                            }
                            className="neo-input"
                          >
                            {Object.entries(OWNERSHIP_STATUS_LABELS).map(([val, lbl]) => (
                              <option key={val} value={val}>
                                {lbl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <NeoInput
                          label="Gross Market Value (₹)"
                          type="number"
                          min={0}
                          value={collateral.market_value_inr}
                          onChange={(e) =>
                            updateCollateral(
                              index,
                              "market_value_inr",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />

                        <NeoInput
                          label="Existing Mortgage (₹)"
                          type="number"
                          min={0}
                          value={collateral.existing_encumbrance_inr}
                          onChange={(e) =>
                            updateCollateral(
                              index,
                              "existing_encumbrance_inr",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />

                        <NeoInput
                          label="City / Location"
                          placeholder="e.g. Bangalore"
                          value={collateral.property_city || ""}
                          onChange={(e) => updateCollateral(index, "property_city", e.target.value)}
                        />

                        <NeoInput
                          label="State"
                          placeholder="e.g. Karnataka"
                          value={collateral.property_state || ""}
                          onChange={(e) =>
                            updateCollateral(index, "property_state", e.target.value)
                          }
                        />
                      </div>

                      {/* Checkboxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <label className="flex items-center gap-2 text-xs font-black text-black uppercase cursor-pointer">
                          <input
                            type="checkbox"
                            checked={collateral.title_clear}
                            onChange={(e) =>
                              updateCollateral(index, "title_clear", e.target.checked)
                            }
                            className="h-4 w-4 border-2 border-black accent-black cursor-pointer"
                          />
                          <span>Clear Title Deed Available</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-black text-black uppercase cursor-pointer">
                          <input
                            type="checkbox"
                            checked={collateral.valuation_report_available}
                            onChange={(e) =>
                              updateCollateral(
                                index,
                                "valuation_report_available",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 border-2 border-black accent-black cursor-pointer"
                          />
                          <span>Valuation Report Ready</span>
                        </label>
                      </div>

                      {/* Net Eligible Output */}
                      <div className="pt-2 border-t-2 border-black flex justify-between items-center text-xs font-black">
                        <span className="text-neutral-600">
                          HAIRCUT: {(haircut * 100).toFixed(0)}%
                        </span>
                        <span className="font-mono text-black">
                          ELIGIBLE VALUE: {formatCurrency(itemEligible)}
                        </span>
                      </div>
                    </div>
                  );
                })
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
                  <span>BACK TO FINANCIALS</span>
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
                <span>{isLoading ? "EVALUATING..." : "REVIEW DOSSIER & RUN AUDIT"}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </NeoButton>
            </div>
          </div>
        </div>

        {/* Right Column: Live LTV Receipt */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 neo-box-lg bg-white p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
              <Shield className="h-4 w-4 text-black" />
              <h3 className="font-black text-black uppercase tracking-tight text-sm">
                LIVE LTV EVALUATION
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Gross Market Value</span>
                <span className="font-mono text-black">{formatCurrency(totalMarketValueInr)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Encumbrances</span>
                <span className="font-mono text-neutral-800">
                  - {formatCurrency(totalEncumbranceInr)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Net Eligible Value</span>
                <span className="font-mono text-black font-black">
                  {formatCurrency(totalEligibleValueInr)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black">
                <span className="text-neutral-600">Required Loan Gap</span>
                <span className="font-mono text-black font-black">
                  {formatCurrency(requestedLoanInr)}
                </span>
              </div>
            </div>

            {/* LTV Meter */}
            {totalEligibleValueInr > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black uppercase">
                  <span>LOAN-TO-VALUE (LTV)</span>
                  <span className="font-mono">{formatPercent(ltvPercent)}</span>
                </div>
                <div className="w-full h-3 border-2 border-black bg-white overflow-hidden">
                  <div
                    className={`h-full border-r-2 border-black ${
                      ltvPercent <= 75
                        ? "bg-[#86EFAC]"
                        : ltvPercent <= 100
                          ? "bg-[#FEF08A]"
                          : "bg-[#F472B6]"
                    }`}
                    style={{ width: `${Math.min(100, ltvPercent)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Security Profile Banner */}
            <div className="neo-box-black p-4 space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#FEF08A] block">
                SECURITY PROFILE VERDICT
              </span>
              <span className="text-lg font-black text-white block">
                {totalEligibleValueInr >= requestedLoanInr
                  ? "FULLY SECURED (PRIME)"
                  : totalEligibleValueInr > 0
                    ? "PARTIALLY SECURED"
                    : "UNSECURED / MERIT BACKED"}
              </span>
              <span className="text-[10px] font-bold text-neutral-300 block pt-1">
                {totalEligibleValueInr >= requestedLoanInr
                  ? "Eligible for premier public bank slabs (SBI, BoB 9.15%-10.25%)."
                  : totalEligibleValueInr > 0
                    ? "Eligible for hybrid collateral + co-signer NBFC products."
                    : "Eligible for fintech & USD collateral-free loans up to lender caps."}
              </span>
            </div>

            <div className="p-2.5 bg-[#86EFAC] border-2 border-black text-[11px] font-bold text-neutral-900 shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center gap-1 font-black text-black uppercase mb-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>AUDIT NOTICE</span>
              </div>
              Deterministic rules will evaluate LTV &lt; 80% for secured public lenders.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
