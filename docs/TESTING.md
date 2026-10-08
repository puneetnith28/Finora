# Finora — Testing Guide

## 1. Testing Goal

Prove that Finora's core education-loan readiness journey works end to end, handles invalid input safely, produces deterministic and explainable financial assessments, protects private data, and remains usable across devices.

## 2. Critical User Journey

Landing
→ Start Assessment
→ Student Profile
→ Study Plan
→ Funding
→ Financial Profile
→ Loan Configuration
→ Collateral
→ Documents
→ Assessment
→ Lender Explanations
→ Report
→ FOIR Simulator

**Release blocker:** this journey must work end to end.

## 3. Testing Types

- Happy path
- Validation
- Boundary conditions
- Financial calculation accuracy
- Rule-engine accuracy
- Error handling
- Permissions/privacy
- File upload security
- Extraction failures
- Responsive UI
- Accessibility
- Regression

## 4. Foundation Tests

- [ ] Fresh frontend install succeeds
- [ ] Fresh backend install succeeds
- [ ] Environment example is sufficient
- [ ] `/health` returns success
- [ ] `/health/db` confirms database connectivity
- [ ] No secrets are committed

## 5. Student Profile Tests

- [ ] Valid profile saves
- [ ] Required fields cannot be skipped
- [ ] Invalid email is rejected
- [ ] Refresh preserves saved information
- [ ] Back navigation preserves information
- [ ] Long input does not break layout
- [ ] Special characters are handled safely

## 6. Study Plan Tests

- [ ] Tuition accepts valid currency values
- [ ] Negative costs are rejected
- [ ] All cost categories calculate correctly
- [ ] Total study cost equals component sum
- [ ] Zero-cost categories work
- [ ] Very large valid values do not break UI/API
- [ ] Refresh preserves study plan

## 7. Funding Tests

- [ ] Savings are included
- [ ] Scholarship is included
- [ ] Fees paid are included
- [ ] Family contribution is included
- [ ] Other funding is included
- [ ] Available funding equals component sum
- [ ] Funding gap cannot become negative
- [ ] Funding gap updates after edits

## 8. Financial Calculation Tests

### Net Worth

- [ ] Assets minus liabilities is correct
- [ ] Zero assets works
- [ ] Zero liabilities works
- [ ] Negative/invalid values are rejected

### EMI

- [ ] Normal principal/rate/tenure produces expected EMI
- [ ] Zero/edge interest handling is defined and tested
- [ ] Invalid tenure is rejected
- [ ] Invalid principal is rejected
- [ ] Rounding is consistent

### FOIR

- [ ] Existing EMI + proposed EMI is used
- [ ] Net income is denominator
- [ ] Zero income is handled safely
- [ ] Percentage rounding is consistent
- [ ] Backend result matches expected test fixture

### LTV

- [ ] Loan / eligible collateral value is correct
- [ ] Zero collateral is handled safely
- [ ] Invalid collateral values are rejected
- [ ] Boundary thresholds are tested

## 9. Lender Rule Engine Tests

- [ ] Passing lender returns `potential_match` where configured
- [ ] Failed mandatory rule produces `not_a_match`
- [ ] Missing information can produce `needs_review`
- [ ] Maximum FOIR boundary is tested
- [ ] Maximum LTV boundary is tested
- [ ] Minimum income boundary is tested
- [ ] Maximum loan amount boundary is tested
- [ ] Required-document rule works
- [ ] Rule explanations identify the actual criterion
- [ ] Changing lender criteria changes future assessments predictably
- [ ] Historical assessment remains unchanged after criteria update

## 10. Assessment Reproducibility Tests

- [ ] Same inputs + same criteria version produce same assessment
- [ ] Assessment stores calculation inputs
- [ ] Assessment stores lender criteria version
- [ ] Assessment stores rule results
- [ ] Historical assessment cannot be silently overwritten

## 11. Document Upload Tests

- [ ] Valid PDF uploads
- [ ] Supported image/document types behave as configured
- [ ] Unsupported extension is rejected
- [ ] MIME type is validated server-side
- [ ] Oversized file is rejected
- [ ] Malicious filename/path is sanitized
- [ ] Failed upload does not delete existing data
- [ ] Delete requires confirmation

## 12. Document Readiness Tests

- [ ] Missing required document is visible
- [ ] Uploaded document becomes ready after successful processing
- [ ] Extraction failure becomes needs-review/failed
- [ ] Retry works
- [ ] Readiness status updates correctly
- [ ] Document category is preserved

## 13. Extraction Tests

- [ ] Text-based PDF extraction works
- [ ] Empty document fails gracefully
- [ ] Malformed document fails gracefully
- [ ] Scanned document follows configured OCR path
- [ ] Extracted value stores source document reference
- [ ] Low-confidence/uncertain extraction is visibly flagged
- [ ] Manual correction is labeled as manual
- [ ] Provider outage does not break manual financial entry

## 14. Discrepancy Tests

- [ ] Matching entered/extracted values produce no discrepancy
- [ ] Meaningful difference creates a flag
- [ ] Small difference inside tolerance does not create a false alarm
- [ ] Multiple discrepancies can coexist
- [ ] Discrepancy never directly decides eligibility

## 15. FOIR Simulator Tests

- [ ] Loan amount changes update EMI
- [ ] Interest changes update EMI
- [ ] Tenure changes update EMI
- [ ] Income changes update FOIR
- [ ] Existing EMI changes update FOIR
- [ ] Simulator does not mutate official assessment
- [ ] Saved scenario can be reopened
- [ ] Scenario comparison shows differences correctly

## 16. Frontend Navigation Tests

- [ ] Continue moves to the correct next screen
- [ ] Back returns to the previous screen
- [ ] Progress indicator reflects actual state
- [ ] Refresh restores persisted state
- [ ] Network failure shows retry
- [ ] Duplicate submit is prevented where necessary
- [ ] Loading states prevent contradictory actions

## 17. Dashboard Tests

- [ ] Progress is accurate
- [ ] Funding gap is accurate
- [ ] FOIR is accurate
- [ ] LTV is accurate
- [ ] Document readiness is accurate
- [ ] Primary CTA changes based on assessment state

## 18. Report Tests

- [ ] Report includes correct student summary
- [ ] Study cost is correct
- [ ] Funding is correct
- [ ] Funding gap is correct
- [ ] Financial metrics are correct
- [ ] Collateral/LTV are correct
- [ ] Lender results match stored assessment
- [ ] Explanations match rule results
- [ ] Report does not claim guaranteed approval
- [ ] PDF export is readable

## 19. Security / Privacy Tests

- [ ] Secrets are not in client bundle
- [ ] Server validates all protected operations
- [ ] User A cannot access User B's data
- [ ] Unauthorized assessment access is rejected
- [ ] Uploaded files cannot escape storage directory
- [ ] Raw database errors are not returned
- [ ] CORS is configured appropriately
- [ ] Sensitive financial data is not logged unnecessarily

## 20. Accessibility Tests

- [ ] All inputs have labels
- [ ] Keyboard reaches all controls
- [ ] Focus is visible
- [ ] Heading hierarchy is logical
- [ ] Error messages are understandable
- [ ] Errors are not communicated by color alone
- [ ] Interactive elements have accessible names
- [ ] Charts have useful textual summaries

## 21. Responsive Tests

Test at minimum:

- [ ] Small mobile
- [ ] Large mobile
- [ ] Tablet
- [ ] Laptop
- [ ] Desktop

Check:

- [ ] No horizontal overflow
- [ ] Buttons remain tappable
- [ ] Forms remain readable
- [ ] Cards stack correctly
- [ ] Tables/rule results remain usable
- [ ] Modal content fits
- [ ] Sticky CTAs do not cover content

## 22. Error-State Tests

- [ ] Backend unavailable
- [ ] Database unavailable
- [ ] Network timeout
- [ ] Invalid API response
- [ ] File upload failure
- [ ] Extraction failure
- [ ] Assessment failure
- [ ] PDF generation failure
- [ ] Retry recovers where possible
- [ ] Existing user data is preserved after failure

## 23. Regression Checklist

After every major phase:

- [ ] Existing assessment journey still works
- [ ] Existing calculations still pass
- [ ] Existing lender rules still pass
- [ ] Existing documents remain accessible
- [ ] Existing reports remain readable
- [ ] No new console errors
- [ ] No new backend tracebacks

## 24. Release Blockers

Do not release if:

- Core assessment journey cannot complete.
- Financial calculations are wrong.
- Lender result cannot be explained.
- Historical assessment is silently mutated.
- User data can be accessed by another user.
- Unsafe files can be uploaded.
- Critical mobile journey is unusable.
- Secrets are exposed.
- The application requires a paid AI service to complete the core demo.

## 25. Test Result Format

For every failure record:

- Test:
- Expected:
- Actual:
- Device/browser:
- Environment:
- Steps to reproduce:
- Screenshot/log:
- Severity:
- Status:

## 26. Manual Reviewer Walkthrough

A hiring-assignment reviewer should be able to:

1. Open Finora.
2. Understand the product in under one minute.
3. Start an assessment.
4. Enter a realistic student study plan.
5. See total cost.
6. Add funding and observe the gap.
7. Add financial data and observe net worth/FOIR.
8. Add collateral and observe LTV.
9. Upload sample documents.
10. Review document readiness.
11. Run the lender assessment.
12. Open a lender card and understand why it matched or failed.
13. Change inputs in the FOIR simulator.
14. Observe the simulated impact.
15. Open/export the final readiness report.

## 27. Testing Principle

Never mark a test as passed because an AI coding agent claims it works. Run the check and record the actual result.
