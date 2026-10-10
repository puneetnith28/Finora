# Finora — International Education Loan Assessment & Financial Readiness Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg?logo=tailwind_css&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-131%20Passed-brightgreen.svg)](docs/TESTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Finora** is an enterprise-grade, deterministic financial intelligence and loan readiness assessment platform engineered for prospective international students, parents, and education loan counselors. It replaces opaque lending guesswork with an authoritative mathematical engine, explainable rule matrices, pre-underwriting document intelligence with OCR discrepancy reconciliation, and real-time debt-service stress testing.

---

## 🎬 Product Demo Video

Watch the comprehensive product demonstration of Finora covering student assessment, multi-currency study plan calculator, financial profile & FOIR stress simulator, pre-underwriting document OCR intelligence, and the counselor underwriting audit report:

[![Finora Product Demonstration](https://img.youtube.com/vi/UusHGlCwY7s/maxresdefault.jpg)](https://youtu.be/UusHGlCwY7s)

> 📺 **Direct Link:** [Watch Finora Product Walkthrough on YouTube](https://youtu.be/UusHGlCwY7s)

---

## 🏛 System Architecture & Design Philosophy

Finora is built around the principle of **strict computational determinism**. In financial underwriting, non-deterministic decisions or binary floating-point roundoff errors lead to compliance failures and incorrect loan eligibility decisions.

```
┌────────────────────────────────────────────────────────────────────────┐
│               Finora Next.js 16 (App Router + Turbopack)               │
│  ┌───────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │ Assessment Wizard │  │ Interactive Sim     │  │ Counselor Report  │ │
│  │ (6-Step Stepper)  │  │ (FOIR & Lender Sim) │  │ (Printable PDF)   │ │
│  └─────────┬─────────┘  └──────────┬──────────┘  └─────────┬─────────┘ │
└────────────┼───────────────────────┼───────────────────────┼───────────┘
             │                       │                       │
             ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Engine                          │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │ Deterministic Calc    │  │ Rule & Lender Matcher │  │ OCR Engine  │ │
│  │ (EMI/FOIR/LTV/Gap)    │  │ (Audit Trail Engine)  │  │ (Discrepancy)│ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬──────┘ │
└──────────────┼──────────────────────────┼─────────────────────┼────────┘
               │                          │                     │
               ▼                          ▼                     ▼
┌───────────────────────────────┐     ┌──────────────────────────────────┐
│   SQLAlchemy ORM + SQLite/PG  │     │   Secure Sandboxed File Store    │
└───────────────────────────────┘     └──────────────────────────────────┘
```

### Core Engineering Invariants
1. **Zero Client-Side Calculation Trust:** All financial formulas (Study Cost, Funding Gap, Net Worth, EMI, FOIR, LTV) execute authoritatively on the backend using Python's `decimal.Decimal` with explicit quantizing.
2. **Immutable Assessment Audit Trails:** Every assessment run stores point-in-time calculation snapshots (`assessment_results` and `assessment_rule_results`), preventing historical audit drift when lender policies change.
3. **Defense-in-Depth Document Ingestion:** Uploaded files undergo 4-tier security validation: payload size limits, extension whitelisting, magic-byte binary header inspection, and isolated UUID disk storage.
4. **Explainable Underwriting Intelligence:** The matching engine decomposes lender rules into hard constraints vs review triggers, outputting transparent human-readable reason codes.

---

## 🌟 The 3 Original Differentiating Features

### 1. Interactive Real-Time FOIR & Loan EMI Stress-Testing Simulator (`/simulator`)
- **The Problem:** Co-borrowers frequently apply for loan amounts without understanding whether their household cash-flow can service the debt under institutional Fixed Obligation to Income Ratio (FOIR) ceilings.
- **Why It Matters:** High FOIR (>50%) is the leading reason for education loan rejections across Indian public sector banks and NBFCs.
- **How Finora Solves It:** A real-time slider interface that dynamically computes monthly amortizing EMIs, aggregates existing obligations, calculates net disposable income, and renders risk badges (`Safe ≤40%`, `Moderate 40-50%`, `Stretched 50-65%`, `Critical >65%`). Users can stress-test interest rate hikes or tenure extensions and immediately observe lender match transitions.

### 2. Explainable Deterministic Rule-by-Rule Underwriting Dossier (`/assessment`)
- **The Problem:** Traditional loan comparison aggregators operate as black boxes, showing generic "Eligible" or "Rejected" badges with zero actionable rationale.
- **Why It Matters:** Education counselors and students require transparent criteria breakdowns (exact CIBIL score cutoffs, collateral haircuts, course level rules, country corridor restrictions) to address bottlenecks before submitting formal applications.
- **How Finora Solves It:** Evaluates applicant context against every lender criterion independently, categorizing outcomes into **Potential Match**, **Needs Review**, or **Not a Match**, complete with itemized pass/fail diagnostics and downloadable counselor reports.

### 3. Pre-Underwriting Document Intelligence & Discrepancy Reconciliation (`/documents`)
- **The Problem:** Misdeclarations between user-typed form figures and uploaded financial proof (salary slips, ITR-V forms, bank statements) trigger weeks of credit underwriting delays and abrupt rejections.
- **Why It Matters:** Detecting and reconciling financial discrepancies *before* formal bank credit submission protects the student's credit profile and expedites sanction timelines.
- **How Finora Solves It:** Inspects binary magic bytes to reject disguised malware, parses document text streams to extract financial evidence (verified net pay, employer name, course tuition), and flags income variances exceeding the configurable tolerance threshold (default: 10%).

---

## 🏦 Authoritative Lender Underwriting Rulebook

Finora's deterministic rule engine is seeded directly from the benchmark dataset:

| Lender Institution | Secured Rate | Unsecured Rate | Min CIBIL | Underwriting Policies & Rule Constraints |
| :--- | :---: | :---: | :---: | :--- |
| **State Bank of India (SBI)** | 8.40% | 9.40% | **750** | Non-collateral restricted to Top 100 Universities. Max loan ₹1.5 Cr. Max FOIR: 50%. |
| **Bank of Baroda (BOB)** | 8.95% (M) / 8.75% (F) | 8.45% | **700** | Non-collateral restricted to Top 100 Universities. Max loan ₹1.5 Cr. Max FOIR: 55%. |
| **Bank of India (BOI)** | 9.00% (M) / 8.60% (F) | *Unavailable* | **670** | Hard constraint: Collateral mandatory. Max loan ₹1.5 Cr. Max FOIR: 55%. |
| **HDFC Credila** | 9.25% – 9.75% | 10.75% | **680** | Dedicated NBFC education specialist. Max loan ₹1.0 Cr. Max FOIR: 60%. |
| **Auxilo Finserve** | 10.00% | 10.25% | **650** | Flexible specialist NBFC criteria. Max loan ₹75 Lakhs. Max FOIR: 65%. |

> **⚠️ Indicative Decision-Support Notice:** Finora is an educational assessment and preparation tool based on deterministic underwriting rules. It does not issue formal loan guarantees or sanction letters.

---

## 🌐 Live Production Deployments & Service Endpoints

Finora is deployed in production across a decoupled multi-cloud topology (Next.js on Vercel Edge + FastAPI on Render):

| Environment / Service | Platform | Endpoint URL | Status |
| :--- | :--- | :--- | :--- |
| **Production Web Application** | Vercel | [https://finora-pi-rust.vercel.app](https://finora-pi-rust.vercel.app) | **Live & Operational** |
| **Backend Core REST API** | Render | [https://finora-backend-7pe7.onrender.com](https://finora-backend-7pe7.onrender.com) | **Live & Operational** |
| **Service Liveness Check** | FastAPI `/health` | [https://finora-backend-7pe7.onrender.com/health](https://finora-backend-7pe7.onrender.com/health) | `{"status": "healthy"}` |
| **Database Readiness Check** | Engine `/health/db` | [https://finora-backend-7pe7.onrender.com/health/db](https://finora-backend-7pe7.onrender.com/health/db) | `{"database": "connected"}` |
| **Interactive OpenAPI Documentation** | Swagger UI | [https://finora-backend-7pe7.onrender.com/docs](https://finora-backend-7pe7.onrender.com/docs) | **Live & Interactive** |

---

## 📚 Master Documentation Suite

Every domain topic is governed by an authoritative, verified technical specification:

- 🏛 **[System Architecture Specification](docs/Architecture.md)** — Comprehensive architecture blueprint with 4 verified Mermaid diagrams covering system context, component layering, assessment data flows, and isolation boundaries.
- 📐 **[Financial Calculation Rules & Formulas](docs/FINANCIAL_RULES.md)** — Exhaustive mathematical equations, Decimal quantizing rules, FOIR risk thresholds, LTV haircut matrices, and the 5 lender criteria sets.
- 🔌 **[REST API Reference Specification](docs/API_REFERENCE.md)** — Complete catalog of all 32+ FastAPI endpoints, HTTP verbs, request/response Pydantic schemas, and error envelopes.
- 🗄 **[Relational Database Schema](docs/DATABASE_SCHEMA.md)** — 10 SQLAlchemy ORM models, table definitions, columns, primary/foreign keys, and cascading delete behaviors.
- ⚙️ **[Environment & Configuration Reference](docs/CONFIGURATION.md)** — Complete dictionary of environment variables across frontend, backend, Docker, and cloud deployments.
- 🚀 **[Production & Local Deployment Runbook](docs/DEPLOYMENT.md)** — Step-by-step deployment guide for Vercel, Render, and Docker Compose with automated curl smoke tests.
- 🔒 **[Security Architecture & Privacy Policy](docs/SECURITY_AND_PRIVACY.md)** — HTTP security response headers, CORS filters, magic-byte binary inspection, and data isolation controls.
- 🧪 **[Quality Assurance & Test Matrix](docs/TESTING.md)** — 131-test pytest matrix, type-checking rules, linting configurations, and verification commands.
- 📋 **[Technical Requirements Document (TRD)](docs/TRD.md)** — Full technical requirements, functional specifications, and technology stack rationales.
- 🗺 **[Application Flow & User Journeys](docs/APP_FLOW.md)** — 6-step wizard state machine, 14-step spotlight onboarding tour, and recovery flows.
- 🧭 **[Master Documentation Index](docs/README.md)** — Navigation guide and recommended reading paths for reviewers and architects.
- 🤝 **[Developer Contribution Guidelines](CONTRIBUTING.md)** — Local setup, commit conventions, coding standards, and PR validation workflows.

---

## 🛠 Technology Stack & Framework Specifications

| Layer | Technology | Version | Technical Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router, Turbopack) | `16.4.0` | React Server Components, server-side rewrite proxying, partial prefetching |
| **UI Library** | React | `19.3.0` | Concurrent rendering, declarative state management |
| **Styling & Design System** | Tailwind CSS (Turbopack) | `v4.0` | Neo-Brutalist design tokens, high contrast, responsive grid layouts |
| **Form Management** | Zod + React Hook Form | `zod 4.6.5` | Client-side strict schema parsing and error boundaries |
| **Iconography** | Lucide React | `1.53.0` | Accessible, tree-shakeable SVG iconography |
| **Backend Framework** | FastAPI + Python | `FastAPI 0.115+`, `Python 3.13` | Asynchronous ASGI request handling, automatic OpenAPI schema generation |
| **Data Validation** | Pydantic v2 | `2.10+` | Strict static type coercion, `ge=0` domain validation |
| **ORM & Database** | SQLAlchemy 2.0 + SQLite 3 | `2.0+` | Declarative `Mapped` columns, `PRAGMA foreign_keys=ON` cascade integrity |
| **Code Quality & Linting**| Ruff + ESLint + TypeScript | Python Ruff, ESLint 9, TS 5 | Zero lint warnings, zero type errors, automated formatting |
| **Test Suite** | Pytest + Asyncio | `pytest 9.1.1` | 131 automated tests across unit, integration, and security layers |

---

## 🚀 Quick Start & Development Setup

### Prerequisites
- Node.js $\ge 20.x$
- Python $\ge 3.13$
- Git $\ge 2.30$

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/puneetnith28/Finora.git
cd Finora

# Install frontend dependencies
npm install

# Setup backend Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 2. Run Complete Quality Verification
Verify the entire codebase with a single command:
```bash
npm run quality
```
*Executes TypeScript type-checking (`tsc --noEmit`), ESLint (`eslint .`), Python Ruff (`ruff check backend`), and all 131 Pytest tests.*

### 3. Start Development Servers
In two separate terminal windows:

```bash
# Terminal 1: Backend FastAPI Server (http://127.0.0.1:8000)
source .venv/bin/activate
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```bash
# Terminal 2: Frontend Next.js Dev Server (http://localhost:3000)
npm run dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔒 Security & Privacy Standards

- **Server-Side Calculations:** Zero client-side computation for loan terms, FOIR, and lender eligibility.
- **File Upload Protection:** MIME magic-byte verification, path traversal sanitization, and 10 MB payload limits.
- **Security Response Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Database Optimization:** All foreign-key constraints and frequent lookup columns (`student_id`, `lender_id`, `assessment_id`) are indexed with cascade deletion.

---

## 📜 License

Finora is open-source software licensed under the [MIT License](LICENSE).
