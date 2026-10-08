"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Trash2,
  Shield,
  ShieldAlert,
  Building,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/StatCard";
import { 
  collateralListSchema,
  type CollateralItem, 
  COLLATERAL_HAIRCUTS, 
  COLLATERAL_TYPE_LABELS, 
  OWNERSHIP_STATUS_LABELS,
  COLLATERAL_PRESETS 
} from "@/lib/validations/collateral";
import { formatCurrency } from "@/lib/utils";

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

  const updateCollateral = (
    index: number,
    field: keyof CollateralItem,
    value: unknown
  ) => {
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
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Collateral Security Configurations
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COLLATERAL_PRESETS.map((preset) => (
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
        {/* Left Column: Collateral Form */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>5. Pledged Collateral & Security</CardTitle>
                <CardDescription>
                  Adding collateral unlocks lower interest rates (SBI, BoB, Canara) and higher loan amounts beyond ₹50L.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCollateral}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Security
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {collaterals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                  <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      No Collateral Pledged (Unsecured Mode)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                      You are evaluating unsecured / collateral-free loans. Lenders like Prodigy Finance, HDFC Credila (Unsecured slab), and Avanse will be evaluated based on student merit and co-borrower FOIR.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCollateral}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Pledged Property or Fixed Deposit
                  </Button>
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
                    <div
                      key={index}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Security Asset #{index + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCollateral(index)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                          label="Collateral Type"
                          value={collateral.collateral_type}
                          onChange={(e) =>
                            updateCollateral(index, "collateral_type", e.target.value)
                          }
                          options={Object.entries(COLLATERAL_TYPE_LABELS).map(([val, lbl]) => ({
                            value: val,
                            label: lbl,
                          }))}
                        />

                        <Select
                          label="Ownership Status"
                          value={collateral.ownership_status}
                          onChange={(e) =>
                            updateCollateral(index, "ownership_status", e.target.value)
                          }
                          options={Object.entries(OWNERSHIP_STATUS_LABELS).map(([val, lbl]) => ({
                            value: val,
                            label: lbl,
                          }))}
                        />

                        <Input
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

                        <Input
                          label="Existing Mortgage / Encumbrance (₹)"
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
                          helperText="Amount already pledged against an active home loan."
                        />

                        <Input
                          label="Property City / Location"
                          placeholder="e.g. Bangalore"
                          value={collateral.property_city || ""}
                          onChange={(e) =>
                            updateCollateral(index, "property_city", e.target.value)
                          }
                        />

                        <Input
                          label="Property State"
                          placeholder="e.g. Karnataka"
                          value={collateral.property_state || ""}
                          onChange={(e) =>
                            updateCollateral(index, "property_state", e.target.value)
                          }
                        />
                      </div>

                      {/* Checkboxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={collateral.title_clear}
                            onChange={(e) =>
                              updateCollateral(index, "title_clear", e.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-[#0f382c] accent-[#0f382c]"
                          />
                          <span>Clear Title Deed Available</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
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
                            className="h-4 w-4 rounded border-slate-300 text-[#0f382c] accent-[#0f382c]"
                          />
                          <span>Govt Approved Valuation Report Ready</span>
                        </label>
                      </div>

                      {/* Net Eligible Output */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          Haircut: {(haircut * 100).toFixed(0)}% | Net Deduction: {formatCurrency(collateral.existing_encumbrance_inr)}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          Eligible Collateral: {formatCurrency(itemEligible)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>

            <CardFooter className="justify-between">
              {onBack ? (
                <Button type="button" variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Financials
                </Button>
              ) : <div />}

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Review Full Profile & Run Assessment
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live LTV Receipt */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live LTV Evaluation
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Market Value</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalMarketValueInr)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Existing Encumbrances</span>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                  - {formatCurrency(totalEncumbranceInr)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Net Eligible Value</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(totalEligibleValueInr)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Target Loan Requirement</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(requestedLoanInr)}
                </span>
              </div>
            </div>

            {/* LTV Meter */}
            {totalEligibleValueInr > 0 ? (
              <div className="space-y-2">
                <ProgressBar
                  value={ltvPercent}
                  label="Loan-to-Value (LTV) Ratio"
                  showPercentage
                  indicatorClassName={
                    ltvPercent <= 75
                      ? "bg-emerald-600 dark:bg-emerald-400"
                      : ltvPercent <= 100
                      ? "bg-amber-600 dark:bg-amber-400"
                      : "bg-rose-600 dark:bg-rose-400"
                  }
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>0%</span>
                  <span className="text-emerald-600 font-bold">75% (SBI Prime)</span>
                  <span className="text-amber-600 font-bold">100% Max</span>
                </div>
              </div>
            ) : null}

            {/* Assessment Status Banner */}
            <div className="p-4 rounded-2xl bg-[#0f382c] text-white dark:bg-emerald-950 dark:border dark:border-emerald-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                Security Profile Verdict
              </span>
              <span className="text-lg font-extrabold text-white dark:text-emerald-300">
                {totalEligibleValueInr >= requestedLoanInr
                  ? "Fully Secured (Prime Slabs)"
                  : totalEligibleValueInr > 0
                  ? "Partially Secured"
                  : "Unsecured / Co-Borrower Backed"}
              </span>
              <span className="text-[11px] text-emerald-200/70 block pt-1">
                {totalEligibleValueInr >= requestedLoanInr
                  ? "Eligible for lowest public sector interest rates (SBI, BoB, Canara 9.15%-10.25%)."
                  : totalEligibleValueInr > 0
                  ? "Sufficient for hybrid collateral + co-signer NBFC products."
                  : "Eligible for fintech & USD collateral-free loans up to lender caps."}
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Deterministic rules will check LTV &lt; 80% for secured public lenders and allow collateral-free NBFC paths.
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
