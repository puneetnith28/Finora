# Finora — Education Loan Assessment & Financial Readiness Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg?logo=tailwind_css&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-131%20Passed-brightgreen.svg)](docs/TESTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Finora** is an authoritative, deterministic education-loan assessment and financial-readiness platform for prospective international students and counselors. It replaces opaque lending guesswork with an exact financial engine, explainable lender underwriting matrices, pre-underwriting document intelligence with OCR discrepancy reconciliation, and real-time scenario simulation.

---

## 🌐 Live Production Deployments & Services

| Resource | Service / Provider | URL | Status |
| :--- | :--- | :--- | :--- |
| **Production Web App** | Next.js 16 (Vercel) | [https://finora-pi-rust.vercel.app](https://finora-pi-rust.vercel.app) | **Live & Verified** |
| **Backend REST API** | FastAPI 0.115 (Render) | [https://finora-backend-7pe7.onrender.com](https://finora-backend-7pe7.onrender.com) | **Live & Verified** |
| **Service Health Check** | FastAPI Liveness | [https://finora-backend-7pe7.onrender.com/health](https://finora-backend-7pe7.onrender.com/health) | `{"status": "healthy"}` |
| **Database Connectivity**| SQLite Engine Status | [https://finora-backend-7pe7.onrender.com/health/db](https://finora-backend-7pe7.onrender.com/health/db) | `{"database": "connected"}` |
| **Interactive API Docs** | Swagger / OpenAPI | [https://finora-backend-7pe7.onrender.com/docs](https://finora-backend-7pe7.onrender.com/docs) | **Live & Interactive** |

---

## 📚 Master Documentation Suite

Finora maintains an exhaustive, non-redundant documentation system:

```
Finora/
├── README.md                          # Master project summary & quickstart
├── CONTRIBUTING.md                    # Developer guide, coding standards & PR workflows
├── LICENSE                            # MIT License
└── docs/
    ├── README.md                      # Documentation index & reading order
    ├── Architecture.md                # System context, component diagrams & data flows
    ├── FINANCIAL_RULES.md             # Authoritative math, FOIR bands & 5 lender criteria
    ├── API_REFERENCE.md               # Complete REST API catalog & schemas
    ├── DATABASE_SCHEMA.md             # Relational models, tables, columns & foreign keys
    ├── CONFIGURATION.md               # Environment variables reference & settings
    ├── DEPLOYMENT.md                  # Vercel, Render & Docker Compose runbooks
    ├── SECURITY_AND_PRIVACY.md        # MIME validation, security headers & CORS policy
    ├── TESTING.md                     # Quality assurance & 131-test pytest matrix
    ├── TRD.md                         # Technical requirements & functional specifications
    └── APP_FLOW.md                    # 6-step wizard, 14-step tour & user journeys
```

### Direct Documentation Links
- 🏛 **[System Architecture & Diagrams](docs/Architecture.md)** — 4 Mermaid blueprints covering system topology, component layering, core financial data flows, and security boundaries.
- 📐 **[Financial Calculation Rules](docs/FINANCIAL_RULES.md)** — Exact mathematical formulas for Study Cost, Funding Gap, Net Worth, EMI, FOIR, LTV haircuts, and 5 lender rulebooks.
- 🔌 **[REST API Reference](docs/API_REFERENCE.md)** — Exhaustive catalog of all endpoints, request/response models, and error envelopes.
- 🗄 **[Database Schema & Models](docs/DATABASE_SCHEMA.md)** — 10 SQLAlchemy ORM models, relational mapping, and cascading delete behaviors.
- ⚙️ **[Environment Configuration](docs/CONFIGURATION.md)** — Variable dictionary for frontend, backend, Docker, and cloud deployments.
- 🚀 **[Deployment Runbook](docs/DEPLOYMENT.md)** — Step-by-step production setup on Vercel and Render with smoke test commands.
- 🔒 **[Security & Privacy Policy](docs/SECURITY_AND_PRIVACY.md)** — Binary magic-byte inspection, security headers, and data isolation controls.
- 🧪 **[Quality Assurance & Test Matrix](docs/TESTING.md)** — 131-test pytest matrix, type-checking, and linting guidelines.
- 📋 **[Technical Requirements Document (TRD)](docs/TRD.md)** — Verified functional scope and non-functional requirements.
- 🗺 **[Application Flow & UX Journeys](docs/APP_FLOW.md)** — 6-step wizard state machine and 14-step spotlight onboarding tour.
- 🤝 **[Developer Contribution Guide](CONTRIBUTING.md)** — Local setup, commit conventions, and pull request workflows.

---

## 🏛 System Architecture Blueprint

```text
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

---

## 🌟 The 3 Original Differentiating Features

### 1. Interactive Real-Time FOIR & Loan EMI Stress-Testing Simulator (`/simulator`)
- **Problem Solved:** Co-borrowers face sudden loan rejections due to exceeding bank Fixed Obligation to Income Ratio (FOIR) limits.
- **Why It Matters:** High FOIR (>50%) is the leading cause of rejection across public and private education lenders in India.
- **How It Works:** A real-time slider interface computing amortizing EMIs and debt burdens on the fly with dynamic risk badges (`Safe ≤40%`, `Moderate 40-50%`, `Stretched 50-65%`, `Critical >65%`) and instant lender transition impact modeling.

### 2. Explainable Deterministic Rule-by-Rule Underwriting Dossier (`/assessment`)
- **Problem Solved:** Black-box loan aggregators give generic "Approved / Rejected" badges without mathematical reasons.
- **Why It Matters:** Counselors and students need transparent audit trails (CIBIL cutoffs, collateral haircuts, course tiers) to fix bottlenecks.
- **How It Works:** Evaluates every criterion independently into **Potential Match**, **Needs Review**, or **Not a Match**, accompanied by transparent pass/fail reason diagnostics and downloadable reports.

### 3. Pre-Underwriting Document Intelligence & Discrepancy Reconciliation (`/documents`)
- **Problem Solved:** Misdeclarations between typed form numbers and uploaded financial evidence cause weeks of processing delays.
- **Why It Matters:** Catching financial discrepancies *before* formal bank credit submission protects student credit scores.
- **How It Works:** Inspects file binary magic bytes to reject disguised malware, extracts financial figures (salary, tuition), and flags income variances exceeding the configured tolerance threshold (default: 10%).

---

## 🏦 Authoritative Lender Underwriting Rulebook

Finora's deterministic rule engine is seeded directly from the benchmark dataset:

| Lender | Indicative Secured Rate | Indicative Unsecured Rate | Min CIBIL | Policy & Underwriting Rules |
| :--- | :---: | :---: | :---: | :--- |
| **State Bank of India (SBI)** | 8.40% | 9.40% (Top 100 Univ) | **750** | Non-collateral restricted to Top 100 Universities. Max FOIR: 50%. |
| **Bank of Baroda (BOB)** | 8.95% (M) / 8.75% (F) | 8.45% (Top 100 Univ) | **700** | Non-collateral restricted to Top 100 Universities. Max FOIR: 55%. |
| **Bank of India (BOI)** | 9.00% (M) / 8.60% (F) | *Unavailable* | **670** | Hard constraint: Collateral mandatory. Max loan up to ₹1.5 Cr. |
| **HDFC Credila** | 9.25% – 9.75% | 10.75% | **680** | Dedicated education NBFC terms. Max FOIR: 60%. |
| **Auxilo Finserve** | 10.00% | 10.25% | **650** | Flexible NBFC criteria. Max FOIR: 65%. |

> **⚠️ Indicative Decision-Support Notice:** Finora is an educational assessment tool based on deterministic criteria. It does not claim to guarantee formal bank loan sanctions.

---

## 🚀 Quick Start Guide

### Unified Quality Suite (Recommended Verification)
```bash
# Clone repository
git clone https://github.com/puneetnith28/Finora.git
cd Finora

# Install frontend dependencies
npm install

# Setup backend environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Run complete quality verification (TypeScript + ESLint + Ruff + 131 Pytest Tests)
npm run quality
```

### Launch Development Servers
```bash
# In terminal 1 (Backend):
source .venv/bin/activate
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# In terminal 2 (Frontend):
npm run dev
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

---

## 📜 License

Finora is licensed under the [MIT License](LICENSE).
