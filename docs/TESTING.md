# Finora — Quality Assurance & Testing Guide

> **Document Status:** Authoritative Testing Specification  
> **Backend Test Suite:** 131 / 131 passing automated Pytest tests  
> **Frontend Type Check:** 0 errors (`tsc --noEmit`)  
> **Frontend Linter:** 0 warnings (`eslint .`)  
> **Backend Linter:** 0 errors (`ruff check backend`)  
> **Quality Verification Command:** `npm run quality`

---

## 1. Quality Assurance Philosophy & Testing Pyramid

Finora's testing architecture is built to ensure complete mathematical determinism, zero floating-point drift, secure document ingestion, and crash-resilient UI workflows:

```
                      ▲
                     / \
                    /   \
                   / E2E \       E2E Workflow & Scenario Walkthroughs
                  / Tests \      (test_backend_e2e.py, test_e2e_walkthrough.py)
                 /─────────\
                /  API &    \    REST Route Tests & Error Envelopes
               / Integration \   (test_assessment_routes.py, test_document_lifecycle.py)
              /───────────────\
             /   Calculation   \ Unit Tests for Financial Engines & Rules
            /   & Model Units   \(test_study_cost.py, test_foir.py, test_emi.py)
           /─────────────────────\
```

---

## 2. Quickstart Quality Verification Commands

Run the full unified quality suite (Frontend TypeScript + ESLint + Backend Ruff + 131 Pytest tests):

```bash
npm run quality
```

Or execute individual test suites:

```bash
# 1. Frontend TypeScript Compilation Check
npm run type-check

# 2. Frontend ESLint
npm run lint

# 3. Backend Python Ruff Linter
npm run lint:backend

# 4. Backend Pytest Suite (All 131 Tests)
npm run test:backend

# 5. Run pytest directly with verbose test names
./.venv/bin/pytest backend/tests -v
```

---

## 3. Comprehensive Backend Test Matrix (131 Passing Tests)

| Category | Test File Path | Test Count | Key Invariants & Assertions Verified |
| :--- | :--- | :--- | :--- |
| **Study Cost Engine** | [`backend/tests/test_study_cost_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_study_cost_calculator.py) | 3 | Component summation, multi-currency conversion, annualized scaling |
| **Funding Engine** | [`backend/tests/test_funding_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_funding_calculator.py) | 3 | Multi-source normalization to INR, category breakdown dictionaries |
| **Funding Gap** | [`backend/tests/test_funding_gap_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_funding_gap_calculator.py) | 4 | Positive gap identification, surplus flooring at ₹0.00, coverage ratios |
| **FOIR Engine** | [`backend/tests/test_foir_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_foir_calculator.py) | 4 | Low/moderate/high/critical risk tiers, zero-income safe division |
| **EMI Amortizer** | [`backend/tests/test_emi_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_emi_calculator.py) | 4 | Compound interest formula, zero-interest edge, annual schedule balance |
| **Collateral & LTV**| [`backend/tests/test_collateral_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_collateral_calculator.py)<br>[`backend/tests/test_ltv_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_ltv_calculator.py) | 8 | Haircut matrix (80% property, 90% FD), joint ownership factors, LTV ratios |
| **Net Worth Engine**| [`backend/tests/test_net_worth_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_net_worth_calculator.py) | 4 | Liquid vs non-liquid aggregation, solvency check, debt-to-asset ratio |
| **Lender Underwriting**| [`backend/tests/test_lender_evaluator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_lender_evaluator.py)<br>[`backend/tests/test_rule_evaluator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_rule_evaluator.py)<br>[`backend/tests/test_rule_types.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_rule_types.py) | 10 | Outcome states (`potential_match`, `needs_review`, `not_a_match`), weighted score math |
| **Document Security**| [`backend/tests/test_document_lifecycle.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_document_lifecycle.py)<br>[`backend/tests/test_security.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_security.py) | 7 | Magic-byte MIME verification, path traversal blocking, 10MB limits |
| **OCR & Discrepancy**| [`backend/tests/test_ocr_discrepancy.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_ocr_discrepancy.py) | 8 | PDF stream regex extraction, tolerance percent comparisons, discrepancy reports |
| **Simulator API** | [`backend/tests/test_simulator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_simulator.py) | 4 | Real-time FOIR stress simulation, lender transition delta comparisons |
| **API Route Suites**| [`backend/tests/test_api_suite.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_api_suite.py)<br>[`backend/tests/test_assessment_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_assessment_routes.py)<br>[`backend/tests/test_student_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_student_routes.py)<br>[`backend/tests/test_study_plan_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_study_plan_routes.py)<br>[`backend/tests/test_funding_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_funding_routes.py)<br>[`backend/tests/test_financial_profile_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_financial_profile_routes.py)<br>[`backend/tests/test_collateral_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_collateral_routes.py)<br>[`backend/tests/test_lender_routes.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_lender_routes.py) | 18 | Status codes (200, 201, 204, 400, 404, 409, 422), CRUD operations, response schemas |
| **Database & Models**| [`backend/tests/test_db.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_db.py)<br>[`backend/tests/test_student_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_student_model.py)<br>[`backend/tests/test_study_plan_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_study_plan_model.py)<br>[`backend/tests/test_funding_source_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_funding_source_model.py)<br>[`backend/tests/test_financial_profile_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_financial_profile_model.py)<br>[`backend/tests/test_asset_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_asset_model.py)<br>[`backend/tests/test_liability_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_liability_model.py)<br>[`backend/tests/test_collateral_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_collateral_model.py)<br>[`backend/tests/test_document_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_document_model.py)<br>[`backend/tests/test_assessment_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_assessment_model.py)<br>[`backend/tests/test_lender_model.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_lender_model.py) | 26 | Foreign-key constraints, cascading deletes, nullable fields, column defaults |
| **System & E2E** | [`backend/tests/test_financial_engine_integration.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_financial_engine_integration.py)<br>[`backend/tests/test_full_system_integration.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_full_system_integration.py)<br>[`backend/tests/test_backend_e2e.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_backend_e2e.py)<br>[`backend/tests/test_e2e_walkthrough.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_e2e_walkthrough.py)<br>[`backend/tests/test_unit_edge_cases.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_unit_edge_cases.py) | 19 | End-to-end candidate lifecycle from profile creation to report export |

---

## 4. End-to-End Critical User Journey Test Checklist

The critical user flow must pass all functional checks before any production release:

1. **Step 1: Student Profile Creation**
   - [x] Create applicant record (`POST /api/students`)
   - [x] Validate duplicate email rejection (`409 Conflict`)
   - [x] Update contact and program preferences (`PUT /api/students/{id}`)

2. **Step 2: Study Plan & Cost Aggregation**
   - [x] Multi-currency entry (USD, EUR, GBP, CAD, AUD)
   - [x] Automatic INR conversion using authoritative FX rates
   - [x] Rejection of negative tuition/living costs (`422 Unprocessable Entity`)

3. **Step 3: Self-Funding & Gap Analysis**
   - [x] Add savings, scholarships, and family support
   - [x] Deterministic calculation of `funding_gap` floored at ₹0.00
   - [x] Calculation of `coverage_ratio` (0.0000 to 1.0000+)

4. **Step 4: Financial Profile & Co-borrower FOIR**
   - [x] Asset and liability item additions
   - [x] Reducing-balance monthly EMI calculation
   - [x] FOIR ratio computation and risk tier assignment (`low`, `moderate`, `high`, `critical`)

5. **Step 5: Collateral Valuation & LTV Haircuts**
   - [x] Encumbrance deduction from gross market value
   - [x] Application of standard haircuts (80% property, 90% FD, 75% gold)
   - [x] Ownership factor scaling (100% sole/parent, 70% third party, 50% joint third party)

6. **Step 6: Document Readiness & Discrepancy Reconciliation**
   - [x] Multi-format upload (PDF, PNG, JPEG) with magic-byte verification
   - [x] Rejection of spoofed files and oversized uploads (>10MB)
   - [x] Income discrepancy evaluation against OCR extracted salary slips

7. **Step 7: Full Assessment Orchestration & Lender Matching**
   - [x] Execution against the 5 GradGuide lenders (SBI, BOB, BOI, HDFC Credila, Auxilo Finserve)
   - [x] Evaluation of hard constraints vs review triggers
   - [x] Generation of immutable point-in-time assessment snapshot
   - [x] Side-by-side historical assessment comparison (`GET /api/assessments/compare`)

8. **Step 8: Interactive Simulator Stress Testing**
   - [x] Real-time loan tenure and interest rate sliding
   - [x] Dynamic risk badge updates and lender match delta projections
