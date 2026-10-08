# Finora — Education Loan Assessment & Financial Readiness Platform

Finora is an Education Loan Assessment & Financial Readiness platform that helps prospective study-abroad students define study plans, calculate education costs, determine funding gaps, build financial profiles, assess collateral, track document readiness, and evaluate eligibility against explainable lender criteria.

---

## 🏛 Architecture Overview

```text
Next.js 14+ (App Router, TypeScript, Tailwind CSS)
                      │
                      │ REST / JSON API
                      ▼
FastAPI (Python, Pydantic v2, SQLAlchemy ORM)
                      │
                      ▼
            SQLite (Local) / PostgreSQL
                      │
             Local File Storage
```

---

## 📁 Repository Structure

```text
Finora/
├── frontend/             # Next.js App Router frontend application
├── backend/              # FastAPI Python backend application
├── docs/                 # Product specifications, TRD, and architecture docs
├── tests/                # Cross-stack and end-to-end integration tests
├── docker-compose.yml    # Container orchestration for local development
├── README.md             # Project documentation
└── .gitignore            # Git ignore definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- Docker & Docker Compose (optional)

### Environment Setup

Copy `.env.example` to `.env` in the root/backend/frontend directories as needed.

---

## 📜 Principles & Governance

1. **Deterministic Financial Engine:** All financial calculations (EMI, FOIR, LTV, net worth, funding gap) execute exclusively on the backend.
2. **Explainable Assessments:** Every lender match or failure produces human-readable, transparent reasoning.
3. **Reproducibility:** Historical assessments are snapshot-versioned and never silently mutated.
4. **Data-driven Rules:** Lender criteria are evaluated deterministically through dedicated rule evaluators.
5. **Security & Validation:** File uploads and inputs are strictly validated server-side.
