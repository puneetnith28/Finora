// Types for Finora application state and domain models

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

export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cibil_score?: number;
  target_country?: string;
  created_at?: string;
  updated_at?: string;
}
