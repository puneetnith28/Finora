import { z } from "zod";

export const assetItemSchema = z.object({
  id: z.string().optional(),
  asset_type: z.enum([
    "savings_account",
    "fixed_deposit",
    "mutual_funds",
    "stocks",
    "residential_property",
    "commercial_property",
    "land",
    "gold_jewellery",
    "vehicle",
    "other",
  ]),
  estimated_value_inr: z.number().min(0, "Asset value must be 0 or greater"),
  is_liquid: z.boolean().default(false),
  description: z.string().optional().default(""),
});

export const liabilityItemSchema = z.object({
  id: z.string().optional(),
  liability_type: z.enum([
    "home_loan",
    "auto_loan",
    "personal_loan",
    "credit_card",
    "education_loan",
    "business_loan",
    "other",
  ]),
  outstanding_amount_inr: z.number().min(0, "Outstanding amount must be 0 or greater"),
  monthly_emi_inr: z.number().min(0, "Monthly EMI must be 0 or greater").default(0),
  description: z.string().optional().default(""),
});

export const financialProfileSchema = z.object({
  co_borrower_relationship: z.string().min(2, "Co-borrower relationship is required").default("father"),
  monthly_income_inr: z.number().min(1, "Primary monthly income must be greater than 0"),
  other_income_inr: z.number().min(0, "Other income must be 0 or greater").default(0),
  existing_monthly_obligations_inr: z.number().min(0, "Existing obligations must be 0 or greater").default(0),
  monthly_living_expenses_inr: z.number().min(0, "Living expenses must be 0 or greater").default(0),
  cibil_score: z.number().min(300).max(900).optional().nullable(),
  assets: z.array(assetItemSchema).default([]),
  liabilities: z.array(liabilityItemSchema).default([]),
});

export type AssetItem = z.infer<typeof assetItemSchema>;
export type LiabilityItem = z.infer<typeof liabilityItemSchema>;
export type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

export const ASSET_TYPE_LABELS: Record<string, string> = {
  savings_account: "Savings Bank Account",
  fixed_deposit: "Fixed Deposit / Recurring Deposit",
  mutual_funds: "Mutual Funds & ETFs",
  stocks: "Equities / Listed Stocks",
  residential_property: "Residential Apartment / House",
  commercial_property: "Commercial Property / Office",
  land: "Non-Agricultural Land Plot",
  gold_jewellery: "Gold / Precious Metals",
  vehicle: "Vehicle / Automobile",
  other: "Other Tangible Asset",
};

export const LIABILITY_TYPE_LABELS: Record<string, string> = {
  home_loan: "Housing / Home Loan",
  auto_loan: "Vehicle / Auto Loan",
  personal_loan: "Unsecured Personal Loan",
  credit_card: "Credit Card Revolving Balance",
  education_loan: "Prior Education Loan",
  business_loan: "Business / Commercial Loan",
  other: "Other Financial Debt",
};

export const FINANCIAL_PRESETS: Array<{
  id: string;
  name: string;
  subtitle: string;
  data: FinancialProfileFormData;
}> = [
  {
    id: "strong-salaried",
    name: "Strong Salaried Parent (₹1.8L/mo)",
    subtitle: "Low existing debt (₹15k EMI), ₹85L Net Worth",
    data: {
      co_borrower_relationship: "father",
      monthly_income_inr: 180000,
      other_income_inr: 25000,
      existing_monthly_obligations_inr: 15000,
      monthly_living_expenses_inr: 45000,
      cibil_score: 790,
      assets: [
        {
          asset_type: "residential_property",
          estimated_value_inr: 7500000,
          is_liquid: false,
          description: "Self-occupied 3BHK in Bangalore",
        },
        {
          asset_type: "mutual_funds",
          estimated_value_inr: 1500000,
          is_liquid: true,
          description: "SIP portfolio",
        },
        {
          asset_type: "savings_account",
          estimated_value_inr: 600000,
          is_liquid: true,
          description: "SBI Salary Account",
        },
      ],
      liabilities: [
        {
          liability_type: "auto_loan",
          outstanding_amount_inr: 400000,
          monthly_emi_inr: 15000,
          description: "Car Loan HDFC",
        },
      ],
    },
  },
  {
    id: "moderate-business",
    name: "Business Proprietor (₹1.1L/mo)",
    subtitle: "Moderate debt (₹28k EMI), ₹45L Net Worth",
    data: {
      co_borrower_relationship: "mother",
      monthly_income_inr: 110000,
      other_income_inr: 10000,
      existing_monthly_obligations_inr: 28000,
      monthly_living_expenses_inr: 35000,
      cibil_score: 730,
      assets: [
        {
          asset_type: "residential_property",
          estimated_value_inr: 5000000,
          is_liquid: false,
          description: "House in Pune",
        },
        {
          asset_type: "fixed_deposit",
          estimated_value_inr: 800000,
          is_liquid: true,
          description: "ICICI Bank FD",
        },
      ],
      liabilities: [
        {
          liability_type: "home_loan",
          outstanding_amount_inr: 1300000,
          monthly_emi_inr: 28000,
          description: "Home loan SBI",
        },
      ],
    },
  },
  {
    id: "high-leverage",
    name: "High FOIR Risk (₹70k/mo)",
    subtitle: "High obligations (₹42k EMI), tight margin",
    data: {
      co_borrower_relationship: "father",
      monthly_income_inr: 70000,
      other_income_inr: 0,
      existing_monthly_obligations_inr: 42000,
      monthly_living_expenses_inr: 20000,
      cibil_score: 690,
      assets: [
        {
          asset_type: "savings_account",
          estimated_value_inr: 250000,
          is_liquid: true,
          description: "Bank balance",
        },
      ],
      liabilities: [
        {
          liability_type: "personal_loan",
          outstanding_amount_inr: 600000,
          monthly_emi_inr: 22000,
          description: "Personal Loan",
        },
        {
          liability_type: "auto_loan",
          outstanding_amount_inr: 500000,
          monthly_emi_inr: 20000,
          description: "Car Loan",
        },
      ],
    },
  },
];
