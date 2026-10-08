// Unified Domain Models and State Types for Finora

export type { StudentFormData, StudentPreset } from "@/lib/validations/student";
export type { StudyPlanFormData } from "@/lib/validations/study_plan";
export type { FundingSourceItem, FundingFormData } from "@/lib/validations/funding";
export type { FinancialProfileFormData, AssetItem, LiabilityItem } from "@/lib/validations/financial_profile";
export type { CollateralItem, CollateralFormData } from "@/lib/validations/collateral";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface EvaluatedCriterion {
  criterion_id?: number | string;
  criterion_name: string;
  criterion_type?: string;
  passed: boolean;
  required: boolean;
  weight?: number;
  expected_value?: string | number;
  actual_value?: string | number;
  explanation?: string;
}

export interface FailedRuleAudit {
  rule_id?: string;
  rule_name?: string;
  rule_type?: string;
  reason?: string;
  field?: string;
  threshold?: unknown;
  actual_value?: unknown;
}

export interface PassedRuleAudit {
  rule_id?: string;
  rule_name?: string;
  rule_type?: string;
}

export interface LenderMatch {
  lender_id: number;
  lender_name: string;
  lender_type: string;
  outcome_state: "eligible" | "conditional" | "ineligible" | "review_required";
  match_score: number;
  interest_rate_min?: number;
  interest_rate_max?: number;
  max_loan_amount_inr?: number;
  rules_evaluated?: number;
  rules_passed?: number;
  rules_failed?: number;
  evaluated_criteria?: EvaluatedCriterion[];
  failed_rules?: FailedRuleAudit[];
  passed_rules?: PassedRuleAudit[];
  conditions?: string[];
  remedial_actions?: string[];
  remedial_suggestions?: string[];
  primary_reason?: string;
}

export interface ReadinessDimension {
  dimension: string;
  score: number;
  max_score: number;
  percentage: number;
  status: "excellent" | "good" | "needs_attention" | "critical";
  description: string;
  recommendation?: string;
}

export interface FullAssessmentResult {
  id: number;
  student_id: number;
  readiness_score: number;
  readiness_band: string;
  total_cost_inr: number;
  total_funding_inr: number;
  funding_gap_inr: number;
  foir_percentage: number;
  net_worth_inr: number;
  total_eligible_collateral_inr: number;
  ltv_percentage?: number | null;
  lender_matches: LenderMatch[];
  dimensions?: ReadinessDimension[];
  disclaimer: string;
  created_at?: string;
}

// Lender Database & Underwriting Criterion Types
export interface LenderCriterion {
  id?: number;
  criterion_type: string;
  operator?: string;
  threshold_value?: number | null;
  threshold_text?: string | null;
  required?: boolean;
  weight?: number;
  configuration_json?: string | null;
}

export interface LenderItem {
  id: number;
  name: string;
  lender_type: string;
  interest_rate_min: number;
  interest_rate_max: number;
  max_loan_amount_inr: number;
  min_cibil_score: number;
  requires_collateral: boolean;
  active: boolean;
  description?: string | null;
  criteria?: LenderCriterion[];
}

// Document Intelligence & Verification Types
export interface ReadinessItem {
  document_type: string;
  title: string;
  description: string;
  mandatory: boolean;
  status: "missing" | "uploaded" | "processing" | "verified" | "rejected" | "needs_review";
  uploaded_document_id?: number | null;
  file_name?: string | null;
  uploaded_at?: string | null;
  remedial_note?: string | null;
}

export interface ReadinessReport {
  student_id: number;
  overall_readiness: "ready" | "partially_ready" | "action_required";
  total_required: number;
  total_uploaded: number;
  total_verified: number;
  total_missing: number;
  items: ReadinessItem[];
}

// OCR Discrepancy Reconciliation Types
export interface DiscrepancyItem {
  id: string;
  field_name: string;
  document_type: string;
  user_entered_value: string | number;
  extracted_value: string | number;
  variance_percentage: number;
  tolerance_percentage: number;
  severity: "none" | "minor" | "major";
  needs_human_review: boolean;
  confidence_score: number;
  review_note: string;
  extraction_method: "pdf_stream" | "tesseract_ocr" | "regex_anchor";
}

// Currency Exchange Types
export interface CurrencyRate {
  currency: string;
  rate_to_inr: number;
  source: string;
  timestamp?: string;
}

export type CurrencyRatesMap = Record<string, number>;
