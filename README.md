# Finora — Education Loan Assessment & Financial Readiness Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg?logo=tailwind_css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Finora** is a financial intelligence and loan readiness assessment platform designed for prospective international students and education loan counselors. It replaces opaque lending guesswork with a deterministic financial engine, explainable rule matrices, document intelligence with OCR discrepancy detection, and scenario simulation.

---

## 🏛 Platform Architecture

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

## ✨ Core Features & Differentiators

### 1. 🎓 6-Step Guided Assessment Wizard
- **Candidate Profile:** Target country, university, degree, and study level.
- **Study Cost Model:** Multi-currency tuition, living expenses, travel, and currency conversion.
- **Funding Sources:** Multi-source capital categorization (savings, family contributions, scholarships).
- **Financial Profile:** Co-borrower monthly income, existing debt obligations, and automatic proposed EMI calculation.
- **Asset & Collateral Register:** Immovable property, fixed deposits, mutual funds with standard conservative lender haircuts (20% real estate, 10% FDs, 30% equities).
- **Evaluation & Synthesis:** Instant multi-lender audit synthesis and scorecard generation.

### 2. 📊 Explainable Multi-Lender Match Engine
- **Categorized Results:** Classifies lenders into **Match Eligible**, **Needs Review**, and **Hard Constraint Failures**.
- **Rule Audit Matrix:** Every criterion (minimum CIBIL, maximum FOIR, required collateral, target country eligibility) displays actual value vs. threshold requirement and human-readable explanation.

### 3. 🎯 Transparent Readiness Score Indicator (0–100)
- **5-Pillar Weighted Scorecard:**
  - **Academic & University Prestige (20%)**
  - **Financial Capacity & FOIR Health (25%)**
  - **Collateral & Security Adequacy (25%)**
  - **Co-Borrower Credit Reliability (15%)**
  - **Document Completeness (15%)**
- Visual radial gauges, contextual status badges (Optimal, Stretched, Critical), and actionable remedial checklists.

### 4. 🎛 Real-Time FOIR & Lender Impact Simulator
- Live slider-driven loan amount, interest rate, tenure, and co-borrower income adjustments.
- Real-time recalculation of monthly EMI, debt obligations, FOIR status badges, and lender eligibility impacts without mutating candidate records.

### 5. 📑 Document Intelligence & OCR Discrepancy Engine
- Mandatory vs. optional checklist mapping per candidate risk profile.
- Automated payload extraction (Salary Slip net pay, ITR gross total income, Bank statement balance).
- Configurable tolerance-based discrepancy detection alerting counselors to revenue misdeclarations.

### 6. ⚖ Scenario Comparison Delta Engine
- Side-by-side assessment version diffing comparing score shifts, FOIR deltas, funding gap variance, and newly unlocked lender options.

### 7. 🖨 Counselor-Ready Printable PDF Reports
- Clean print-optimized layout hiding navigation UI, rendering crisp vector charts, breakdown tables, and formal evaluation disclosures.

### 8. 🚀 5 Built-in Demo Scenarios
- **Scenario A:** High-Flyer Ivy League (STEM USA, Full collateral, high income).
- **Scenario B:** High Deficit Borderline (UK Masters, tight funding gap, borderline FOIR).
- **Scenario C:** Unsecured Tier-1 German Candidate (Zero collateral, NBFC target).
- **Scenario D:** Co-Borrower Stretched Debt (Over-leveraged liabilities).
- **Scenario E:** Complete Perfect Profile (Ready for institutional sanction).

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16.4 (App Router) | High-performance React framework with Turbopack |
| **Frontend Styling** | Tailwind CSS 4 + Lucide Icons | Responsive fintech design system with emerald/slate palette |
| **Backend Framework** | FastAPI (Python 3.13+) | High-throughput asynchronous REST API |
| **Validation & Types** | Pydantic v2 & TypeScript | Strict end-to-end type safety |
| **Database & ORM** | SQLAlchemy 2.0 + SQLite / PG | Declarative models with cascade integrity and indexing |
| **Containerization** | Docker & Docker Compose | Multi-stage production container builds |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- Docker & Docker Compose (optional)

### Method 1: Local Development

1. **Clone & Setup Repository:**
   ```bash
   git clone https://github.com/puneetnith28/Finora.git
   cd Finora
   ```

2. **Backend Setup:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   npm install
   ```

4. **Launch Application:**
   ```bash
   ./scripts/start-dev.sh
   ```
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Method 2: Docker Compose

```bash
./scripts/start-prod.sh
```

---

## 🧪 Running Tests & Quality Verification

Finora includes a rigorous test suite spanning 130+ unit, integration, and security test cases.

```bash
# Backend unit & integration tests
pytest backend/tests/ -v

# Python linting
ruff check backend

# Frontend type checking
npm run type-check

# Frontend production build verification
npm run build
```

---

## 🔒 Security & Performance Standards

- **Server-Side Calculations:** Zero client-side computation for loan terms, FOIR, and lender eligibility.
- **File Upload Protection:** MIME magic-byte verification, path traversal sanitization, and size caps.
- **Security Response Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Database Optimization:** All foreign key constraints and frequent lookup columns (`student_id`, `lender_id`, `assessment_id`) are indexed.
