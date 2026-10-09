# Contributing to Finora

Thank you for your interest in contributing to Finora. We welcome contributions that improve system reliability, calculation precision, documentation clarity, security hardening, and user experience.

---

## 1. Development Environment Setup

### 1.1 Prerequisites
- **Node.js:** $\ge 20.x$ (LTS recommended)
- **Python:** $\ge 3.13$
- **Git:** $\ge 2.30$
- **Docker & Docker Compose:** *(Optional, for containerized local testing)*

### 1.2 Initial Repository Setup
```bash
# 1. Clone the repository
git clone https://github.com/puneetnith28/Finora.git
cd Finora

# 2. Install Frontend Dependencies
npm install

# 3. Setup Python Backend Virtual Environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 1.3 Running Development Servers
In two separate terminal sessions:

```bash
# Terminal 1: Backend FastAPI Server (runs on http://127.0.0.1:8000)
source .venv/bin/activate
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```bash
# Terminal 2: Frontend Next.js Dev Server (runs on http://localhost:3000)
npm run dev
```

The Next.js frontend automatically proxies `/api/*` requests to the local backend on port 8000.

---

## 2. Code Quality & Pre-Commit Verification

Before submitting any commit or pull request, you **must** run the unified quality suite:

```bash
npm run quality
```

This single command runs:
1. **Frontend Type-Check:** `tsc --noEmit` (Must pass with 0 errors)
2. **Frontend Linter:** `eslint .` (Must pass with 0 warnings)
3. **Backend Linter:** `./.venv/bin/ruff check backend` (Must pass with 0 errors)
4. **Backend Test Suite:** `./.venv/bin/pytest backend/tests` (Must pass 131/131 tests)

### Automated Formatting
Format your code automatically using the pre-configured formatters:
```bash
# Format Frontend code
npm run format

# Format Backend Python code
npm run format:backend
```

---

## 3. Branching & Commit Conventions

### 3.1 Branch Naming
- `feat/<feature-name>`: New capabilities or functional enhancements
- `fix/<bug-name>`: Bug fixes and calculation corrections
- `docs/<topic>`: Documentation updates and clarifications
- `refactor/<module>`: Structural code improvements without behavioral changes
- `test/<suite>`: New test suites and regression additions

### 3.2 Commit Message Standards
We follow the **Conventional Commits** specification. Commit messages must be concise, professional, and explain the *why* rather than restating the diff. Never include task IDs, issue numbers, or step numbers in commit headers.

**Format:**
```
<type>(<optional-scope>): <imperative summary>

[optional body explaining motivation and architectural context]
```

**Allowed Types:**
- `feat`: A new user-facing or API feature
- `fix`: A bug fix in financial math, routing, or UI state
- `docs`: Documentation only changes
- `style`: Formatting, whitespace, or linting adjustments
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance optimization
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build process, dependency updates, or auxiliary tool changes

---

## 4. Financial Calculation Principles

When modifying any service in [`backend/app/services/`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/):
1. **Never use standard binary floats:** Always use `decimal.Decimal` to avoid binary floating-point roundoff errors.
2. **Deterministic Rounding:** Explicitly quantize monetary outputs to `Decimal("0.01")` and ratios to `Decimal("0.0001")`.
3. **Unit Tests Required:** Every calculation change must be accompanied by comprehensive Pytest unit tests in `backend/tests/` covering positive values, zero values, boundary thresholds, and invalid input rejection.

---

## 5. Submitting Pull Requests

1. Ensure your branch is synced with the latest `main` branch.
2. Run `npm run quality` and confirm 100% green checks.
3. Open a Pull Request on GitHub against `main` with a clear description of:
   - The problem being solved or feature added.
   - The verified test coverage.
   - Any documentation files updated.
