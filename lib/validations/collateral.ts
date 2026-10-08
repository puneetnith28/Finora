import { z } from "zod";

export const collateralItemSchema = z.object({
  id: z.string().optional(),
  collateral_type: z.enum([
    "residential_property",
    "commercial_property",
    "non_agricultural_land",
    "fixed_deposit",
    "lic_policy",
    "gold",
    "government_bonds",
    "other",
  ]),
  ownership_status: z.enum([
    "sole_owner",
    "co_owned_parents",
    "co_owned_third_party",
    "ancestral",
  ]).default("sole_owner"),
  market_value_inr: z.number().min(0, "Market value must be 0 or greater"),
  existing_encumbrance_inr: z.number().min(0, "Encumbrance must be 0 or greater").default(0),
  property_city: z.string().optional().default(""),
  property_state: z.string().optional().default(""),
  title_clear: z.boolean().default(true),
  valuation_report_available: z.boolean().default(false),
  description: z.string().optional().default(""),
});

export const collateralListSchema = z.object({
  collaterals: z.array(collateralItemSchema),
});

export type CollateralItem = z.infer<typeof collateralItemSchema>;
export type CollateralFormData = z.infer<typeof collateralListSchema>;

export const COLLATERAL_HAIRCUTS: Record<string, number> = {
  residential_property: 0.80, // 80% LTV eligibility
  commercial_property: 0.70, // 70% LTV eligibility
  non_agricultural_land: 0.60, // 60% LTV eligibility
  fixed_deposit: 0.90, // 90% LTV eligibility
  lic_policy: 0.85, // 85% surrender value
  gold: 0.75, // 75% RBI gold norm
  government_bonds: 0.85,
  other: 0.50,
};

export const COLLATERAL_TYPE_LABELS: Record<string, string> = {
  residential_property: "Residential Apartment / House (80% Haircut)",
  commercial_property: "Commercial Office / Shop (70% Haircut)",
  non_agricultural_land: "Non-Agricultural Land Plot (60% Haircut)",
  fixed_deposit: "Bank Fixed Deposit (90% Haircut)",
  lic_policy: "LIC / Life Insurance Surrender Value (85% Haircut)",
  gold: "Gold Bullion / Sovereign Gold Bonds (75% Haircut)",
  government_bonds: "Government Bonds / NSC (85% Haircut)",
  other: "Other Tangible Collateral (50% Haircut)",
};

export const OWNERSHIP_STATUS_LABELS: Record<string, string> = {
  sole_owner: "Sole Owner (Parent or Student)",
  co_owned_parents: "Jointly Owned with Parents",
  co_owned_third_party: "Jointly Owned with Relatives / Third Party",
  ancestral: "Ancestral / Undivided Family Property",
};

export const COLLATERAL_PRESETS: Array<{
  id: string;
  name: string;
  subtitle: string;
  collaterals: CollateralItem[];
}> = [
  {
    id: "residential-bangalore",
    name: "Prime Residential Property (₹85L)",
    subtitle: "Apartment in Bangalore, Clear Title, No Debt",
    collaterals: [
      {
        collateral_type: "residential_property",
        ownership_status: "co_owned_parents",
        market_value_inr: 8500000,
        existing_encumbrance_inr: 0,
        property_city: "Bangalore",
        property_state: "Karnataka",
        title_clear: true,
        valuation_report_available: true,
        description: "3BHK Freehold Apartment in Whitefield",
      },
    ],
  },
  {
    id: "liquid-fd-pledge",
    name: "Fixed Deposit Pledge (₹40L)",
    subtitle: "Bank FD at 90% LTV (Zero legal verification delay)",
    collaterals: [
      {
        collateral_type: "fixed_deposit",
        ownership_status: "sole_owner",
        market_value_inr: 4000000,
        existing_encumbrance_inr: 0,
        property_city: "Mumbai",
        property_state: "Maharashtra",
        title_clear: true,
        valuation_report_available: true,
        description: "SBI Fixed Deposit Receipts",
      },
    ],
  },
  {
    id: "unsecured-only",
    name: "No Collateral (Unsecured / Non-Collateral Loan)",
    subtitle: "Evaluate unsecured NBFC & fintech loans (₹0 collateral)",
    collaterals: [],
  },
];
