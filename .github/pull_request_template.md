## Description

<!-- Provide a clear summary of the changes introduced in this PR. -->

**Related Issue(s):** Fixes # <!-- or Closes # -->

---

## Type of Change

- [ ] `feat`: New user-facing or API feature
- [ ] `fix`: Bug fix or calculation adjustment
- [ ] `docs`: Documentation addition or update
- [ ] `refactor`: Code restructuring with no behavioral change
- [ ] `test`: New or modified unit/integration tests
- [ ] `chore`: CI/CD, tooling, or dependency maintenance

---

## Subsystem Impact

- [ ] **Assessment Wizard & Workflow** (`/assessment`)
- [ ] **Financial Engine & Calculation Rules** (EMI / FOIR / LTV / Net Worth)
- [ ] **Lender Underwriting & Matching Matrix**
- [ ] **Document Processing & OCR Discrepancy** (`/documents`)
- [ ] **Interactive FOIR Simulator** (`/simulator`)
- [ ] **Backend Database / Alembic Migrations**
- [ ] **CI / CD Workflows & Infrastructure**

---

## Pre-Submission Verification Checklist

- [ ] **Unified Quality Suite:** Passed `npm run quality` locally (TypeScript, ESLint, Python Ruff, Pytest).
- [ ] **Deterministic Calculations:** All financial calculations strictly utilize `decimal.Decimal` with explicit quantizing (no floating-point approximations).
- [ ] **Test Coverage:** Added or updated Pytest tests for any modified financial rules or endpoints.
- [ ] **Database Integrity:** Foreign-key cascade rules and Alembic migrations have been tested (`alembic -c backend/alembic.ini current`).
- [ ] **Security & Privacy:** No API keys, passwords, database credentials, or sensitive personal data are included in this PR or Git history.
- [ ] **Documentation:** Updated relevant documentation in `docs/` or `README.md` if behavior or environment variables changed.
