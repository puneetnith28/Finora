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

## 📋 Hiring Assignment Feature Write-Up & Compliance

This repository implements the full requirements of the **GradGuide Education Loan Assessment Tool** assignment.

### 1. Mandatory Functional Coverage
| Assignment Area | Description | Implementation in Finora |
| :--- | :--- | :--- |
| **Study** | Country, university, course, tuition, living costs | Multi-currency course fee breakdown with automated exchange rate conversion and inflation buffer. |
| **Funding** | Savings, scholarship, fees paid, family contribution | Multi-item liquid capital register with real-time net loan requirement (funding gap) calculation. |
| **Financial Profile** | Income, ITRs, assets, liabilities, net worth | Co-borrower income, existing debts, categorized assets & liabilities, net worth summary, and FOIR ratio. |
| **Collateral** | Property / other assets and available value | Immovable/liquid security registry with conservative lender haircut modeling and live LTV percentage. |
| **Documents** | ITR, bank statements, salary slips, CA net worth, property docs | Pre-underwriting document vault with magic-byte MIME validation, status tracking, and OCR discrepancy engine. |
| **Loan Assessment** | Funding gap, collateral vs non-collateral route, lender criteria | Deterministic evaluation engine matching candidate profiles against bank & NBFC policies with complete explainability. |

---

### 2. 🌟 The 3 Original Features

The assignment asks to build three original features and explain the problem solved, why it matters, and how the solution works:

#### Feature 1: Interactive Real-Time FOIR & Loan EMI Stress-Testing Simulator (`/simulator`)
- **What Problem It Solves:** Students and counselors often apply for loan amounts without knowing if their co-borrower's income can service the debt under bank Fixed Obligation to Income Ratio (FOIR) limits.
- **Why It Matters:** High FOIR (>50%) is the single leading reason for education loan rejections across Indian public & private banks.
- **How the Solution Works:** A slider-driven simulator that computes exact monthly amortizing EMIs and total monthly obligations in real-time, displaying dynamic risk badges (`Safe ≤40%`, `Moderate 40-50%`, `Stretched 50-60%`, `High Risk >60%`) and automated remedial suggestions (e.g., tenure expansion, adding co-borrowers, clearing personal loans).

#### Feature 2: Explainable Deterministic Rule-by-Rule Underwriting Dossier (`/assessment/[id]/report`)
- **What Problem It Solves:** Traditional aggregator websites act as opaque black boxes that display generic "Eligible / Rejected" badges without mathematical reasons.
- **Why It Matters:** Counselors need transparent audit trails (exact CIBIL cutoffs, collateral haircuts, university tier requirements) to provide credible advice and fix candidate bottlenecks.
- **How the Solution Works:** Evaluates every criterion independently into **Direct Approval**, **Conditional Approval**, or **Ineligible**, accompanied by an itemized criteria checklist, root-cause diagnostics, and a counselor-ready printable PDF report.

#### Feature 3: Pre-Underwriting Document Intelligence & OCR Discrepancy Reconciliation (`/documents`)
- **What Problem It Solves:** Data misdeclarations between typed form numbers and actual uploaded financial evidence (salary slips, ITR-V, bank statements) cause weeks of underwriting delays and sudden rejections.
- **Why It Matters:** Catching and reconciling financial discrepancies *before* submitting to bank credit underwriters protects the student's credit score and expedites sanctions.
- **How the Solution Works:** Validates file magic bytes to prevent spoofed uploads, extracts financial figures (monthly net income, bank balances, tuition fees), and calculates percentage variance against form entries with configurable tolerance thresholds.

---

### 3. 🏦 Reference Lender Database

Finora's deterministic rule engine is seeded directly from the provided **GradGuide Education Loan Lender Database**:

| Lender | Non-Collateral Rate | Collateral Rate | Min CIBIL | Conditions / Policy |
| :--- | :--- | :--- | :---: | :--- |
| **State Bank of India (SBI)** | 9.40% | 8.40% | **750** | Non-collateral restricted to Top 100 Universities. |
| **Bank of Baroda (BOB)** | 8.45% | 8.95% (Boys) / 8.75% (Girls) | **700** | Non-collateral restricted to Top 100 Universities. |
| **Bank of India (BOI)** | *Not Possible* | 9.00% (Boys) / 8.60% (Girls) | **670** | Hard constraint: Collateral mandatory. |
| **HDFC Credila** | 10.75% | 9.25% – 9.75% | **680** | Dedicated NBFC education loan terms. |
| **Auxilo Finserve** | 10.25% | 10.00% | **650** | Unsecured & secured custom student slabs. |

> **⚠️ Regulatory Decision-Support Notice:** Finora is an indicative decision-support and assessment product built on deterministic underwriting rules. It does not claim to guarantee formal loan sanctions or rejections.

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
