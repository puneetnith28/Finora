# Finora — Application Flow

## 1. Primary Journey
Landing Page
→ Start Assessment
→ Student Profile
→ Study Plan
→ Study Cost Summary
→ Funding Sources
→ Funding Gap
→ Financial Profile
→ Assets & Liabilities
→ Loan Configuration
→ FOIR Summary
→ Collateral
→ LTV Summary
→ Document Vault
→ Document Readiness
→ Lender Assessment
→ Explainable Lender Matches
→ Readiness Report
→ FOIR Simulator
→ Assessment Complete

## 2. Entry Points
- Landing page CTA: `Start my assessment`
- Returning user: dashboard → continue assessment
- Direct assessment link: resume an existing draft

## 3. Global Navigation
Primary product navigation:
- Overview
- Study Plan
- Funding
- Financial Profile
- Collateral
- Documents
- Lender Assessment
- Simulator
- Report

A visible progress indicator should communicate where the user is in the journey.

## 4. Landing Page
### Purpose
Explain Finora in one clear statement and move users into the assessment.

### Primary CTA
`Check my financial readiness`

### Secondary CTA
`See how it works`

### Sections
1. Hero
2. How Finora works — numbered 01–05 flow
3. What Finora calculates
4. Explainable assessment preview
5. Document readiness preview
6. FOIR simulator preview
7. Final CTA

### States
- Normal
- Loading when starting an assessment
- Error if the assessment cannot be created

## 5. Assessment Start
System creates a draft assessment/student context.

### Failure
- Preserve any existing data.
- Show a recoverable error.
- Allow retry.

## 6. Student Profile
### Inputs
- Name
- Email
- Academic level
- Optional family/co-applicant details

### Actions
- Continue
- Back
- Save draft

### Validation
- Required fields cannot be skipped.
- Email must be valid when provided.

### Important behavior
Going back must preserve saved data.

## 7. Study Plan
### Inputs
- Country
- University
- Course
- Duration
- Tuition
- Living costs
- Travel
- Insurance
- Other costs

### System response
Show a live cost breakdown and total study cost.

### Empty state
Show helpful examples instead of a blank dashboard.

### Validation
Costs must be numeric and non-negative.

## 8. Study Cost Summary
Display:
- Tuition
- Living
- Travel
- Insurance
- Other
- Total study cost

Primary action: `Continue to funding`

## 9. Funding Sources
### Inputs
- Savings
- Scholarship
- Fees paid
- Family contribution
- Other confirmed funding

### System response
Show:
`Total Study Cost`
minus
`Available Funding`
=
`Funding Gap`

The funding gap becomes a major visual metric.

## 10. Financial Profile
### Inputs
- Gross income
- Net income
- Existing EMI
- Other obligations
- Assets
- Liabilities

### System response
Calculate and explain net worth.

## 11. Loan Configuration
### Inputs
- Requested loan amount
- Interest rate
- Tenure

### System response
Calculate proposed EMI.

### Validation
- Loan amount cannot be negative.
- Interest rate cannot be negative.
- Tenure must be within configured safe bounds.

## 12. FOIR Summary
Display:
- Monthly net income
- Existing EMI
- Proposed EMI
- Total EMI obligation
- FOIR percentage

Add an explanation:
`FOIR shows how much of monthly net income is committed to EMI obligations.`

Do not label a result as approved/rejected solely from a universal FOIR number.

## 13. Collateral
### Inputs
- Collateral type
- Description
- Ownership
- Market value
- Existing encumbrance

### System response
Calculate eligible collateral value according to lender configuration.

## 14. LTV Summary
Display:
- Requested loan
- Eligible collateral value
- LTV percentage
- Lender-specific threshold when available

Explain the result in plain language.

## 15. Document Vault
### Upload categories
- Admission letter
- Scholarship proof
- ITR
- Salary slip
- Bank statement
- Property document
- Passport
- Other

### Upload states
- Selecting
- Uploading
- Uploaded
- Extracting
- Ready
- Needs review
- Failed

### Errors
- Unsupported type
- File too large
- Upload failure
- Extraction failure

Never lose previously entered assessment data because a document fails.

## 16. Document Readiness
Display:
- Required documents
- Uploaded documents
- Missing documents
- Extraction status
- Discrepancy flags

Example discrepancy:
`Entered monthly net income: ₹85,000`
`Extracted salary evidence: ₹78,000`
`Difference: ₹7,000`

The system flags the discrepancy for review rather than deciding fraud or eligibility.

## 17. Lender Assessment
### Entry action
`Run assessment`

### System steps
1. Validate required data.
2. Load lender criteria.
3. Calculate financial metrics.
4. Evaluate deterministic rules.
5. Store an immutable assessment snapshot/version.
6. Generate rule-level results.
7. Rank/display configured matches.

### Loading state
Show progress such as:
- Checking affordability
- Checking collateral
- Checking documents
- Comparing lender criteria
- Preparing explanation

### Failure
- Keep existing data.
- Explain what failed.
- Allow retry.

## 18. Explainable Lender Matches
Each lender card shows:
- Assessment state
- Key positive factors
- Failed/uncertain criteria
- FOIR result
- LTV result
- Loan amount check
- Document readiness
- Next actions

States:
- Potential match
- Needs review
- Not a match

Never show a fake approval badge.

## 19. Readiness Report
Sections:
1. Student summary
2. Study cost
3. Funding
4. Funding gap
5. Financial profile
6. Loan affordability
7. Collateral
8. Documents
9. Lender assessment
10. Improvement actions

Actions:
- View full report
- Export PDF
- Return to dashboard

## 20. FOIR Simulator
Simulator starts from the saved assessment but does not mutate it.

Adjustable inputs:
- Loan amount
- Interest rate
- Tenure
- Monthly income
- Existing EMI

Live outputs:
- EMI
- Total EMI burden
- FOIR
- Change versus current scenario

Action:
`Save scenario`

Saved scenarios are labeled separately from the official assessment.

## 21. Returning User Flow
Sign in → Dashboard → Existing Assessment → Continue / Review / Re-run assessment / Open report

## 22. Dashboard Flow
Dashboard should summarize:
- Assessment progress
- Funding gap
- FOIR
- LTV
- Document readiness
- Assessment status
- Last updated time

Primary CTA changes based on progress:
- Continue assessment
- Complete documents
- Review assessment
- View report

## 23. Recovery / Secondary Flows
### Back
Return to previous screen without losing saved data.

### Refresh
Reload persisted data.

### Network failure
Show retry while preserving local form state where practical.

### Session expiration
Redirect to authentication and preserve a safe continuation path.

### Assessment rerun
Create a new assessment version rather than silently modifying historical results.

### Delete document
Ask for confirmation before destructive deletion.

## 24. Important States
Every important screen must define:
- Loading
- Empty
- Validation error
- Network error
- Success/saved
- Permission error
- Processing
- Needs review

## 25. Mobile Flow
On mobile:
- Use a single-column layout.
- Keep primary CTA sticky where appropriate.
- Make progress visible but compact.
- Ensure financial cards do not overflow.
- Allow tables/rule details to collapse into cards.

## 26. UX Rule
The user should never have to understand lending terminology before seeing the explanation. Show the number first, then explain what it means and what action can improve it.
