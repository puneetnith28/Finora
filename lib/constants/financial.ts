// Centralized Financial & Underwriting Constants for Finora

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", defaultRate: 86.50 },
  { code: "EUR", symbol: "€", name: "Euro", defaultRate: 92.20 },
  { code: "GBP", symbol: "£", name: "British Pound", defaultRate: 108.40 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", defaultRate: 62.10 },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar", defaultRate: 55.80 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", defaultRate: 1.00 },
] as const;

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 86.50,
  EUR: 92.20,
  GBP: 108.40,
  CAD: 62.10,
  AUD: 55.80,
  INR: 1.00,
};

export const FOIR_THRESHOLDS = {
  PRIME_MAX: 35,      // <= 35% FOIR -> Excellent / Prime Tier (Score: 95)
  STANDARD_MAX: 50,   // <= 50% FOIR -> Standard Safe Banking Tier (Score: 80)
  ELEVATED_MAX: 65,   // <= 65% FOIR -> Elevated / Conditional Tier (Score: 55)
  STRESSED_MIN: 65,   // > 65% FOIR  -> High Risk / Stressed Tier (Score: 30)
} as const;

export const COLLATERAL_HAIRCUTS: Record<string, { label: string; haircutPercent: number; maxLtvPercent: number }> = {
  residential_property: { label: "Residential Apartment / House", haircutPercent: 20, maxLtvPercent: 80 },
  commercial_property: { label: "Commercial Office / Shop", haircutPercent: 30, maxLtvPercent: 70 },
  land: { label: "Non-Agricultural Land Plot", haircutPercent: 40, maxLtvPercent: 60 },
  fixed_deposit: { label: "Bank Fixed Deposit", haircutPercent: 5, maxLtvPercent: 95 },
  mutual_funds: { label: "Mutual Funds / Equities", haircutPercent: 30, maxLtvPercent: 70 },
  lic_policy: { label: "Life Insurance Surrender Value", haircutPercent: 10, maxLtvPercent: 90 },
  gold: { label: "Gold / Precious Bullion", haircutPercent: 25, maxLtvPercent: 75 },
  government_bonds: { label: "Government Securities / Sovereign Bonds", haircutPercent: 10, maxLtvPercent: 90 },
  other: { label: "Other Asset", haircutPercent: 50, maxLtvPercent: 50 },
};

export const DEFAULT_SIMULATOR_PARAMS = {
  loanAmount: 4500000,
  interestRate: 10.5,
  tenureMonths: 120,
  monthlyIncome: 150000,
  existingObligations: 25000,
} as const;
