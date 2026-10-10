# Finora — Master Documentation Index & Reading Guide

> **Document Status:** Authoritative Documentation Hub  
> **Repository:** [puneetnith28/Finora](https://github.com/puneetnith28/Finora)  
> **Production Frontend:** [https://finora-pi-rust.vercel.app](https://finora-pi-rust.vercel.app)  
> **Production API:** [https://finora-backend-7pe7.onrender.com](https://finora-backend-7pe7.onrender.com)

---

## 1. Documentation Map & Canonical Owners

Finora maintains a strictly modular, non-redundant documentation system where every domain topic has exactly one authoritative owner:

| Document | Canonical Scope | Primary Target Audience |
| :--- | :--- | :--- |
| [`Architecture.md`](file:///home/puneetyadav1625/Projects/Finora/docs/Architecture.md) | System topology, component layering, core assessment data flows, and security boundaries. | Software Architects, Senior Engineers |
| [`FINANCIAL_RULES.md`](file:///home/puneetyadav1625/Projects/Finora/docs/FINANCIAL_RULES.md) | Exact mathematical formulas for Study Cost, Funding Gap, Net Worth, EMI, FOIR, LTV haircuts, and 5 lender rulebooks. | Domain Experts, Underwriters, Backend Engineers |
| [`API_REFERENCE.md`](file:///home/puneetyadav1625/Projects/Finora/docs/API_REFERENCE.md) | Complete REST endpoint catalog, HTTP methods, Pydantic schemas, status codes, and error envelopes. | Frontend Engineers, API Integrators, QA |
| [`DATABASE_SCHEMA.md`](file:///home/puneetyadav1625/Projects/Finora/docs/DATABASE_SCHEMA.md) | Relational database schema, 10 SQLAlchemy ORM models, foreign-key cascades, and column constraints. | Database Administrators, Backend Engineers |
| [`CONFIGURATION.md`](file:///home/puneetyadav1625/Projects/Finora/docs/CONFIGURATION.md) | Exhaustive reference of environment variables across frontend, backend, Docker, and cloud hosts. | DevOps, SREs, Backend Engineers |
| [`DEPLOYMENT.md`](file:///home/puneetyadav1625/Projects/Finora/docs/DEPLOYMENT.md) | Step-by-step production runbooks for Vercel, Render, and Docker Compose with smoke test commands. | DevOps, Infrastructure Engineers, Evaluators |
| [`SECURITY_AND_PRIVACY.md`](file:///home/puneetyadav1625/Projects/Finora/docs/SECURITY_AND_PRIVACY.md) | Security response headers, CORS filters, magic-byte binary inspection, and data isolation controls. | Security Reviewers, Compliance Auditors |
| [`MAINTENANCE.md`](file:///home/puneetyadav1625/Projects/Finora/docs/MAINTENANCE.md) | Automated CI/CD pipelines, CodeQL security scanning, Dependabot governance, and incident recovery. | DevOps, SREs, Maintainers |
| [`TESTING.md`](file:///home/puneetyadav1625/Projects/Finora/docs/TESTING.md) | Quality assurance strategy, full 131-test pytest matrix, linting rules, and verification commands. | QA Engineers, Backend Developers, Reviewers |
| [`TRD.md`](file:///home/puneetyadav1625/Projects/Finora/docs/TRD.md) | Comprehensive technical requirements, functional specifications, and technology stack rationales. | Technical Leads, Project Evaluators |
| [`APP_FLOW.md`](file:///home/puneetyadav1625/Projects/Finora/docs/APP_FLOW.md) | Detailed user journeys, 6-step wizard state machine, 14-step spotlight tour, and recovery flows. | Product Designers, Frontend Developers |

---

## 2. Recommended Reading Paths

### Path A: Quick Technical Evaluation (15 Minutes)
1. Read the root [`README.md`](file:///home/puneetyadav1625/Projects/Finora/README.md) for the executive overview and live demo links.
2. Review [`docs/Architecture.md`](file:///home/puneetyadav1625/Projects/Finora/docs/Architecture.md) to inspect the system context and data flow diagrams.
3. Review [`docs/FINANCIAL_RULES.md`](file:///home/puneetyadav1625/Projects/Finora/docs/FINANCIAL_RULES.md) to inspect the mathematical determinism and lender underwriting rules.
4. Run `npm run quality` locally to verify TypeScript compilation, ESLint, Python Ruff, and all 131 passing Pytest tests.

### Path B: Deep Architecture & Code Review
1. [`docs/Architecture.md`](file:///home/puneetyadav1625/Projects/Finora/docs/Architecture.md) $\rightarrow$ High-level system structure and network topology.
2. [`docs/DATABASE_SCHEMA.md`](file:///home/puneetyadav1625/Projects/Finora/docs/DATABASE_SCHEMA.md) $\rightarrow$ Data models, entities, and cascading foreign-key rules.
3. [`docs/API_REFERENCE.md`](file:///home/puneetyadav1625/Projects/Finora/docs/API_REFERENCE.md) $\rightarrow$ API endpoints, contracts, and error structures.
4. [`docs/SECURITY_AND_PRIVACY.md`](file:///home/puneetyadav1625/Projects/Finora/docs/SECURITY_AND_PRIVACY.md) $\rightarrow$ Binary file validation, CORS whitelisting, and isolation.
5. [`docs/TESTING.md`](file:///home/puneetyadav1625/Projects/Finora/docs/TESTING.md) $\rightarrow$ Comprehensive test coverage matrix.

### Path C: Operations & Deployment Runbook
1. [`docs/CONFIGURATION.md`](file:///home/puneetyadav1625/Projects/Finora/docs/CONFIGURATION.md) $\rightarrow$ Environment settings and default values.
2. [`docs/DEPLOYMENT.md`](file:///home/puneetyadav1625/Projects/Finora/docs/DEPLOYMENT.md) $\rightarrow$ Vercel and Render deployment runbooks with curl smoke tests.
3. [`CONTRIBUTING.md`](file:///home/puneetyadav1625/Projects/Finora/CONTRIBUTING.md) $\rightarrow$ Local development environment setup and pull request workflows.
