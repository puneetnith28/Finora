# Finora — Technical Requirements Document (TRD)

> **Document Status:** Authoritative Technical Specification  
> **Repository Verified Version:** 1.0.0  
> **Architectural Topology:** Next.js 16.4 Frontend (Vercel) + FastAPI 0.115 Backend (Render)

---

## 1. Executive Summary & Product Objective

Finora is a deterministic education-loan assessment and financial-readiness platform designed for students pursuing international higher education. It systematically aggregates student academic profiles, multi-currency study plans, declared self-funding, household income and liabilities, pledged collateral, and pre-underwriting documents. 

Finora executes deterministic financial calculations for **Study Costs (FX-normalized)**, **Funding Gap**, **Household Net Worth**, **Reducing-Balance Monthly EMI**, **Fixed Obligation to Income Ratio (FOIR)**, and **Collateral Loan-to-Value (LTV)**. The platform maps these metrics against configurable lender criteria, producing transparent, explainable match evaluations and a comprehensive Readiness Report.

> [!IMPORTANT]
> Finora is an **indicative assessment and financial-readiness tool**. It is neither a direct lending entity nor a guaranteed loan sanctioning service.

---

## 2. Core Functional Requirements

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. PROFILE &    │       │ 2. COSTS &      │       │ 3. FINANCIALS & │
│    ACADEMICS    │──────▶│    FUNDING GAP  │──────▶│    FOIR ENGINE  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                             │
                                                             ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 6. READINESS    │       │ 5. LENDER MATCH │       │ 4. COLLATERAL & │
│    REPORT       │◀──────│    & EXPLANATION│◀──────│    DOCUMENTS    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 2.1 Student Profile Management
- Collects student identity, email, nationality, destination corridor (USA, UK, Canada, Australia, Germany, Ireland, Singapore, France), target university, and academic degree level.
- Rejects duplicate email registrations via HTTP `409 Conflict`.

### 2.2 Study Plan & Multi-Currency Normalization
- Aggregates tuition, living expenses, travel/visa, health insurance, and miscellaneous costs.
- Normalizes native currency expenses to INR using verified central bank baseline exchange rates (USD: 85.00, EUR: 92.00, GBP: 108.00, CAD: 62.00, AUD: 55.00).
- Calculates annualized costs based on total program duration in months.

### 2.3 Self-Funding & Funding Gap Calculation
- Declares personal savings, academic scholarships, family sponsorships, and prior fee payments.
- Computes `funding_gap = max(0.00, total_study_cost_inr - total_funding_inr)`.
- Calculates self-funding `coverage_ratio` (floored at ₹0.00 to prevent negative loan requirements).

### 2.4 Household Financial Profile & FOIR Engine
- Captures co-borrower monthly gross/net income, existing loan EMIs, and credit card obligations.
- Computes proposed loan EMI using standard compound reducing-balance amortization.
- Evaluates FOIR ratio: $\text{FOIR} = \frac{\text{Existing EMIs} + \text{Proposed EMI} + \text{Other Fixed Debt}}{\text{Monthly Net Income}}$.
- Categorizes debt service into 4 risk tiers: `low_risk` ($\le 40\%$), `moderate_risk` ($40.01\%-60\%$), `high_risk` ($60.01\%-80\%$), `critical_risk` ($>80\%$).

### 2.5 Collateral Valuation & LTV Haircuts
- Evaluates pledged assets: Residential Property (80% LTV / 20% haircut), Fixed Deposits (90%), Gold (75%), Government Bonds (85%), Insurance Surrender Value (80%), Other Assets (50%).
- Applies ownership adjustments: 100% for sole or joint-parent ownership, 70% for third-party blood relatives, 50% for joint third-party titles.
- Calculates `LTV = (Requested Loan Amount / Eligible Collateral Value) * 100` and determines `coverage_status` (`fully_secured`, `partially_secured`, `unsecured`).

### 2.6 Pre-Underwriting Document Intelligence & Discrepancy Engine
- Supports PDF, PNG, and JPEG uploads up to 10 MB per file.
- Inspects binary magic header bytes (`%PDF-`, `\x89PNG`, `\xff\xd8\xff`) to reject spoofed files.
- Extracts income figures from salary slips/ITRs via regex/stream parsing and flags discrepancies exceeding the configurable tolerance threshold (default: 10%).

### 2.7 Authoritative Lender Underwriting Engine
- Evaluates candidate profile against 5 benchmark lenders (State Bank of India, Bank of Baroda, Bank of India, HDFC Credila, Auxilo Finserve).
- Evaluates hard constraints vs review triggers and assigns outcome states: `potential_match`, `needs_review`, `not_a_match`.
- Stores immutable assessment snapshots in `assessment_results` and `assessment_rule_results` to prevent historical calculation drift.

### 2.8 Interactive Real-Time Simulator
- Allows real-time sliding of loan amount, tenure (12–360 months), and interest rate (5–20%).
- Instantly recalculates EMI, FOIR, risk badge, and lender eligibility transitions without mutating the saved official assessment.

---

## 3. Technology Stack & Framework Specifications

| Layer | Component / Technology | Version / Configuration | Technical Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | Next.js (App Router, Turbopack) | `16.4.0` | React Server Components, server-side rewrite proxying, partial prefetching |
| **UI Framework** | React | `19.3.0` | Concurrent rendering, declarative state management |
| **Styling** | Tailwind CSS (Turbopack) | `v4.0` | Neo-Brutalist design tokens, high contrast, responsive grid layouts |
| **Form Validation**| Zod + React Hook Form | `zod 4.6.5` | Client-side strict schema parsing and error boundaries |
| **Icons & Visuals** | Lucide React | `1.53.0` | Accessible, tree-shakeable SVG UI iconography |
| **Backend Core** | FastAPI + Python | `FastAPI 0.115+`, `Python 3.13` | Asynchronous ASGI request handling, OpenAPI auto-generation |
| **Data Validation** | Pydantic v2 | `2.10+` | Strict static type coercion, `ge=0` domain validation |
| **ORM & Persistence**| SQLAlchemy 2.0 + SQLite 3 | `2.0+` | Declarative `Mapped` columns, `PRAGMA foreign_keys=ON` cascade integrity |
| **Linting & Code Quality**| Ruff + ESLint + TypeScript | Python Ruff, ESLint 9, TS 5 | Zero lint warnings, zero type errors, automated formatting |
| **Test Framework** | Pytest + Asyncio | `pytest 9.1.1` | 131 automated tests across unit, integration, and security layers |

---

## 4. System Non-Functional Requirements

### 4.1 Determinism & Mathematical Accuracy
- Floating-point arithmetic is strictly prohibited in persistence and financial calculation logic. All math executes via `decimal.Decimal` with explicit rounding modes.
- Assessments are 100% reproducible: identical inputs evaluated against the same criteria yield bit-identical metric results.

### 4.2 Security & Data Isolation
- File uploads are validated via binary magic bytes and saved under random UUIDs in isolated `/uploads/{student_id}/` directories.
- Path traversal is strictly blocked via directory prefix verification.
- HTTP security response headers (`nosniff`, `DENY`, `1; mode=block`, `strict-origin-when-cross-origin`) are injected on all outgoing responses.
- Unhandled server exceptions are masked into uniform JSON envelopes without leaking stack traces.

### 4.3 Performance & Responsiveness
- Financial calculations execute in under 10 milliseconds.
- Frontend bundle size is minimized via Turbopack code splitting.
- Responsive single-column fluid layouts adapt seamlessly from 320px mobile screens to 4K desktop viewports.

---

## 5. Traceability to Technical Artifacts

- **Architecture Blueprints:** [`docs/Architecture.md`](file:///home/puneetyadav1625/Projects/Finora/docs/Architecture.md)
- **Financial Calculation Rules:** [`docs/FINANCIAL_RULES.md`](file:///home/puneetyadav1625/Projects/Finora/docs/FINANCIAL_RULES.md)
- **REST API Catalog:** [`docs/API_REFERENCE.md`](file:///home/puneetyadav1625/Projects/Finora/docs/API_REFERENCE.md)
- **Database Schema Models:** [`docs/DATABASE_SCHEMA.md`](file:///home/puneetyadav1625/Projects/Finora/docs/DATABASE_SCHEMA.md)
- **Deployment Runbooks:** [`docs/DEPLOYMENT.md`](file:///home/puneetyadav1625/Projects/Finora/docs/DEPLOYMENT.md)
- **Quality Verification & Test Matrix:** [`docs/TESTING.md`](file:///home/puneetyadav1625/Projects/Finora/docs/TESTING.md)
