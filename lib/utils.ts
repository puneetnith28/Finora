import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx and twMerge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with internationalization
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "INR",
  maximumFractionDigits = 0
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits,
    }).format(numericAmount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits,
  }).format(numericAmount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number | string | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "0.0%";
  }
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  return `${numericValue.toFixed(decimals)}%`;
}

/**
 * Format large numbers in compact Indian or Western notation (e.g. ₹45.5 Lakhs)
 */
export function formatCompactCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)} K`;
  }
  return `₹${val.toFixed(0)}`;
}

/**
 * Status color helper for readiness bands
 */
export function getReadinessColor(band: string | null | undefined): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (band?.toLowerCase()) {
    case "excellent":
    case "strong":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30",
        badge: "bg-emerald-600 text-white",
      };
    case "moderate":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
        badge: "bg-amber-600 text-white",
      };
    case "weak":
    case "critical":
    case "high_risk":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        badge: "bg-rose-600 text-white",
      };
    default:
      return {
        bg: "bg-slate-500/10 dark:bg-slate-500/20",
        text: "text-slate-700 dark:text-slate-400",
        border: "border-slate-500/30",
        badge: "bg-slate-600 text-white",
      };
  }
}
