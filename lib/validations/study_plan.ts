import { z } from "zod";

export const studyPlanSchema = z.object({
  tuition_fees_original: z.number().min(0, "Tuition must be 0 or greater"),
  living_expenses_original: z.number().min(0, "Living expenses must be 0 or greater"),
  travel_expenses_original: z.number().min(0, "Travel expenses must be 0 or greater").default(0),
  insurance_original: z.number().min(0, "Insurance must be 0 or greater").default(0),
  visa_fees_original: z.number().min(0, "Visa fees must be 0 or greater").default(0),
  miscellaneous_original: z.number().min(0, "Miscellaneous expenses must be 0 or greater").default(0),
  currency: z.string().min(2, "Currency is required").default("USD"),
  duration_months: z.number().min(1, "Duration must be at least 1 month").max(72, "Duration cannot exceed 72 months").default(24),
  inflation_rate_percent: z.number().min(0, "Inflation rate cannot be negative").max(30, "Inflation rate cannot exceed 30%").default(5.0),
  exchange_rate_to_inr: z.number().min(0.01, "Exchange rate must be positive"),
});

export type StudyPlanFormData = z.infer<typeof studyPlanSchema>;

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 84.5,
  EUR: 92.0,
  GBP: 107.5,
  CAD: 62.0,
  AUD: 55.0,
  SGD: 63.5,
  INR: 1.0,
};

export interface StudyPlanPreset {
  id: string;
  title: string;
  subtitle: string;
  currency: string;
  data: StudyPlanFormData;
}

export const STUDY_PLAN_PRESETS: StudyPlanPreset[] = [
  {
    id: "us-masters-cmu",
    title: "US 2-Year MS (Carnegie Mellon)",
    subtitle: "USD 65k Tuition + USD 24k Living (24 Months)",
    currency: "USD",
    data: {
      tuition_fees_original: 65000,
      living_expenses_original: 24000,
      travel_expenses_original: 2500,
      insurance_original: 3000,
      visa_fees_original: 600,
      miscellaneous_original: 1500,
      currency: "USD",
      duration_months: 24,
      inflation_rate_percent: 5.0,
      exchange_rate_to_inr: 84.5,
    },
  },
  {
    id: "germany-tum",
    title: "Germany 2-Year MS (TU Munich)",
    subtitle: "EUR 12k Tuition + EUR 22k Living Blocked Account",
    currency: "EUR",
    data: {
      tuition_fees_original: 12000,
      living_expenses_original: 22400,
      travel_expenses_original: 1800,
      insurance_original: 2400,
      visa_fees_original: 150,
      miscellaneous_original: 1000,
      currency: "EUR",
      duration_months: 24,
      inflation_rate_percent: 3.5,
      exchange_rate_to_inr: 92.0,
    },
  },
  {
    id: "uk-1yr-mba",
    title: "UK 1-Year MBA (London Business School)",
    subtitle: "GBP 70k Tuition + GBP 20k Living (12 Months)",
    currency: "GBP",
    data: {
      tuition_fees_original: 70000,
      living_expenses_original: 20000,
      travel_expenses_original: 1500,
      insurance_original: 1200,
      visa_fees_original: 500,
      miscellaneous_original: 2000,
      currency: "GBP",
      duration_months: 12,
      inflation_rate_percent: 4.0,
      exchange_rate_to_inr: 107.5,
    },
  },
];
