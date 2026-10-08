import { z } from "zod";

export const fundingSourceItemSchema = z.object({
  id: z.string().optional(),
  source_type: z.enum([
    "savings",
    "scholarship",
    "sponsorship",
    "family_support",
    "fixed_deposit",
    "provident_fund",
    "other",
  ]),
  amount_original: z.number().min(0, "Amount must be 0 or greater"),
  currency: z.string().min(2, "Currency is required").default("INR"),
  exchange_rate_to_inr: z.number().min(0.01, "Exchange rate must be positive").default(1.0),
  description: z.string().optional().default(""),
  verified: z.boolean().default(true),
});

export const fundingListSchema = z.object({
  sources: z.array(fundingSourceItemSchema),
});

export type FundingSourceItem = z.infer<typeof fundingSourceItemSchema>;
export type FundingFormData = z.infer<typeof fundingListSchema>;

export const FUNDING_SOURCE_LABELS: Record<string, string> = {
  savings: "Liquid Bank Savings",
  scholarship: "Merit / Need Scholarship",
  sponsorship: "Corporate / Institutional Sponsorship",
  family_support: "Parental & Family Contribution",
  fixed_deposit: "Fixed Deposits (FD)",
  provident_fund: "Provident Fund (EPF / PPF)",
  other: "Other Confirmed Funding",
};

export const FUNDING_PRESETS: Array<{
  id: string;
  name: string;
  subtitle: string;
  sources: FundingSourceItem[];
}> = [
  {
    id: "moderate-self-funded",
    name: "Moderate Self-Funding (₹25L)",
    subtitle: "₹15L Savings + ₹10L Family Contribution",
    sources: [
      {
        source_type: "savings",
        amount_original: 1500000,
        currency: "INR",
        exchange_rate_to_inr: 1.0,
        description: "Student's personal liquid bank balance",
        verified: true,
      },
      {
        source_type: "family_support",
        amount_original: 1000000,
        currency: "INR",
        exchange_rate_to_inr: 1.0,
        description: "Parental savings support",
        verified: true,
      },
    ],
  },
  {
    id: "scholarship-boost",
    name: "Scholarship + FD Support (₹35L)",
    subtitle: "$20k University Scholarship + ₹18L Fixed Deposit",
    sources: [
      {
        source_type: "scholarship",
        amount_original: 20000,
        currency: "USD",
        exchange_rate_to_inr: 84.5,
        description: "Dean's Graduate Merit Scholarship",
        verified: true,
      },
      {
        source_type: "fixed_deposit",
        amount_original: 1800000,
        currency: "INR",
        exchange_rate_to_inr: 1.0,
        description: "HDFC Bank FD",
        verified: true,
      },
    ],
  },
  {
    id: "minimal-funding",
    name: "Full Loan Required (₹5L)",
    subtitle: "₹5L Emergency Reserve Only",
    sources: [
      {
        source_type: "savings",
        amount_original: 500000,
        currency: "INR",
        exchange_rate_to_inr: 1.0,
        description: "Initial travel & visa reserve",
        verified: true,
      },
    ],
  },
];
