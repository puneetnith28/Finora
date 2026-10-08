# Finora — Technical Requirements Document

## 1. Project Overview
Finora is an education-loan assessment and financial-readiness platform for students planning higher education. It collects a student's study plan, education costs, available funding, financial profile, assets, liabilities, collateral, and supporting documents, then deterministically calculates funding gap, net worth, EMI, FOIR, collateral value, and LTV. It evaluates the profile against configurable demo lender criteria and produces explainable lender matches and a financial-readiness report.

Finora is an **assessment and readiness tool, not a loan approval or guarantee service**.

## 2. Product Goals
- Help students understand the true cost of their study plan.
- Calculate how much funding is actually required.
- Give students a clear picture of financial strength and gaps.
- Assess collateral and affordability using transparent formulas.
- Show which configured lender criteria the student satisfies or fails.
- Explain every assessment result in plain language.
- Identify missing or inconsistent supporting documents.
- Let users simulate changes to income, EMI, loan amount, tenure, or collateral and immediately see the impact on FOIR/LTV.
- Produce a professional readiness report that can be reviewed or shared.

## 3. Technical Goals
- Full end-to-end workflow from student profile to assessment and report.
- Financial calculations performed server-side and reproducibly.
- Lender criteria stored as data rather than hard-coded into UI components.
- No LLM makes financial eligibility decisions.
- Document extraction is treated as evidence, never as the source of truth for a lending decision.
- Application can run locally without paid AI APIs.
- Responsive, accessible UI on mobile, tablet, and desktop.
- Clear loading, validation, empty, success, and error states.

## 4. Proposed Tech Stack
### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Recharts or equivalent charting library

### Backend
- FastAPI
- Python
- Pydantic
- SQLAlchemy

### Database
- SQLite for the MVP/local development.
- SQLAlchemy keeps the persistence layer portable to PostgreSQL for production deployment if required.

### Documents
- Local file storage for MVP.
- Provider-agnostic extraction adapter for PDF/text/OCR.
- Optional OCR/AI provider integrations must remain behind an interface.

### Authentication
- MVP may use a simple authenticated user model if required by deployment scope.
- All protected operations must be authorized server-side.
- Demo mode must never expose real credentials or secrets.

### Deployment
- Frontend: Vercel or equivalent.
- Backend: Render/Railway/Fly.io or equivalent Python host.
- Database: SQLite for demo environments where persistent disk is available; PostgreSQL for production environments where required.

## 5. Core Functional Requirements

### 5.1 Student Profile
User can create/update:
- Name
- Email
- Phone (optional)
- Current education level
- Academic details
- Co-applicant/family context where applicable

### 5.2 Study Plan
User can enter:
- Destination country
- University/institution
- Course/program
- Course duration
- Tuition cost
- Living cost
- Travel cost
- Insurance cost
- Other expected costs

System calculates:
`Total Study Cost = Tuition + Living + Travel + Insurance + Other`

### 5.3 Funding Sources
User can enter:
- Personal savings
- Scholarships
- Fees already paid
- Family contribution
- Other confirmed funding

System calculates:
`Available Funding = Savings + Scholarship + Fees Paid + Family Contribution + Other`

`Funding Gap = max(Total Study Cost - Available Funding, 0)`

### 5.4 Financial Profile
User can enter:
- Monthly gross income
- Monthly net income
- Existing EMIs
- Other monthly obligations
- Assets
- Liabilities

System calculates:
`Net Worth = Total Assets - Total Liabilities`

### 5.5 Loan / EMI Assessment
User can enter or select:
- Requested loan amount
- Interest rate
- Tenure

System calculates proposed EMI using a standard amortization formula.

### 5.6 FOIR
Finora calculates:
`FOIR = (Existing EMI + Proposed EMI) / Monthly Net Income × 100`

FOIR thresholds are lender-specific and must not be treated as a universal industry rule.

### 5.7 Collateral
User can add:
- Property
- Fixed deposit / eligible financial asset
- Other configured collateral type
- Estimated market value
- Ownership information
- Existing encumbrance where applicable

System calculates eligible collateral value using configurable lender rules.

### 5.8 LTV
`LTV = Requested Loan Amount / Eligible Collateral Value × 100`

The lender's configured LTV limit determines the assessment outcome.

### 5.9 Documents
Supported document categories include:
- Admission letter
- Scholarship proof
- ITR
- Salary slip
- Bank statement
- Property document
- Passport
- Other supporting document

Each document has:
- Type
- File metadata
- Upload status
- Verification/readiness status
- Extraction status
- Extracted evidence where available
- Discrepancy flags where applicable

### 5.10 Document Readiness
Finora identifies:
- Missing required documents
- Documents with extraction failure
- Documents with suspicious/incomplete evidence
- Meaningful differences between entered financial values and extracted values

### 5.11 Lender Assessment
Each lender has configurable criteria such as:
- Maximum FOIR
- Maximum LTV
- Minimum income
- Minimum net worth where applicable
- Maximum loan amount
- Collateral requirement
- Required documents
- Other deterministic rules

Assessment result states:
- `potential_match`
- `needs_review`
- `not_a_match`

Every result must contain reasons and failed/passed rule details.

### 5.12 Readiness Report
Report includes:
- Study cost breakdown
- Available funding
- Funding gap
- Financial profile
- Net worth
- Proposed loan and EMI
- FOIR
- Collateral and LTV
- Document readiness
- Lender matches
- Rule-by-rule explanations
- Key actions to improve readiness

Report must never say that a loan is guaranteed or approved.

### 5.13 FOIR Simulator
User can adjust:
- Loan amount
- Interest rate
- Tenure
- Monthly income
- Existing EMI

The simulator recalculates EMI and FOIR without changing the saved assessment until the user explicitly saves a scenario.

## 6. Data Model
Core entities:
- User
- Student
- StudyPlan
- FundingSource
- FinancialProfile
- IncomeSource
- Liability
- Asset
- Collateral
- Document
- Lender
- LenderCriteria
- Assessment
- AssessmentResult
- AssessmentRuleResult
- SimulatorScenario
- Report

Historical assessments should be immutable/versioned so a new lender-rule version does not silently rewrite a previous result.

## 7. API Requirements
Minimum API surface:
- `GET /health`
- `GET /health/db`
- `POST /api/students`
- `GET /api/students/{id}`
- `PATCH /api/students/{id}`
- Study plan CRUD endpoints
- Funding CRUD endpoints
- Financial profile endpoints
- Assets/liabilities/collateral endpoints
- `GET /api/lenders`
- `GET /api/lenders/{id}`
- Document upload/list/delete endpoints
- Document readiness endpoint
- `POST /api/assessments`
- `GET /api/assessments/{id}`
- `GET /api/assessments/{id}/report`
- `POST /api/simulator/preview`
- `POST /api/simulator/scenarios`

All request bodies must be validated server-side.

## 8. Non-Functional Requirements
### Performance
- Initial dashboard should feel responsive on normal broadband.
- Financial calculations should return quickly because they are deterministic.
- Large document processing must show progress/loading states.

### Security
- Never expose secrets in client-side code.
- Validate uploaded file type and size server-side.
- Sanitize filenames and prevent path traversal.
- Authorize access to every protected resource.
- Do not expose raw database or stack-trace errors.

### Accessibility
- Proper labels for inputs.
- Keyboard-accessible controls.
- Visible focus states.
- Logical heading hierarchy.
- Errors must not rely on color alone.
- Adequate contrast.

### Responsiveness
- Mobile first.
- Support small mobile, large mobile, tablet, laptop, and desktop.
- No horizontal overflow.

## 9. Integrations
Optional integrations:
- OCR/document extraction provider.
- PDF report generation.
- Analytics/error monitoring if deployment requires them.

The product must remain runnable without paid AI services.

## 10. Financial Decision Rules
1. Financial calculations live in backend services.
2. Lender rules are data-driven.
3. No universal FOIR threshold.
4. No LLM decides eligibility.
5. OCR provides evidence only.
6. Every lender result must be explainable.
7. Assessments must be reproducible.
8. Historical assessments must be versioned.
9. Demo lender policies must be explicitly labeled as demo criteria.
10. Finora must not represent an assessment as guaranteed approval.

## 11. UI Direction
The visual system should take inspiration from the supplied Orville, CampusEvac, and Hacktoberfest references:
- Strong editorial hero section.
- Large, confident typography.
- Clear numbered journey.
- Strong CTA hierarchy.
- Spacious sections.
- Product screenshots/cards presented as evidence.
- Distinct role/status cards.
- Playful but professional visual details.
- Responsive layouts and purposeful motion.

The references are design inspiration, not assets to copy verbatim. Finora must retain its own brand, content, illustrations, icons, and product language.

## 12. Constraints
- Keep the architecture understandable for a hiring-assignment reviewer.
- Avoid unnecessary microservices.
- Avoid Kubernetes.
- Avoid WebSockets unless a demonstrated requirement appears.
- Do not make blockchain part of the core system.
- Do not make paid AI APIs mandatory.
- Do not put financial calculations only in the frontend.
- Do not hard-code lender policy into React components.
- Do not present demo criteria as real bank policy.

## 13. Definition of Done
Finora is technically complete when a fresh reviewer can:
1. Clone the repository.
2. Install dependencies.
3. Configure environment variables from the example file.
4. Start frontend and backend.
5. Initialize the database.
6. Create a student profile.
7. Complete the study plan.
8. Enter funding sources and see the funding gap.
9. Enter financial information and see net worth/FOIR.
10. Add collateral and see LTV.
11. Upload supporting documents.
12. See document readiness and discrepancy flags.
13. Run a lender assessment.
14. Understand why each lender matched or failed.
15. Use the FOIR simulator.
16. Generate/view a readiness report.
17. Complete the journey without developer intervention.

