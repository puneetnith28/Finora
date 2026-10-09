# Finora — REST API Reference Specification

> **Document Status:** Authoritative API Contract  
> **API Version:** 1.0.0  
> **Base URLs:**  
> - **Production (Direct):** `https://finora-backend-7pe7.onrender.com`  
> - **Production (Next.js Proxy):** `https://finora-pi-rust.vercel.app/api`  
> - **Local Development:** `http://localhost:8000` (FastAPI) / `http://localhost:3000/api` (Next.js Proxy)  
> **Content-Type:** `application/json` (except `/api/students/{id}/documents` which accepts `multipart/form-data`)

---

## 1. Global Conventions & Standards

### 1.1 HTTP Status Codes
- `200 OK`: Successful retrieval or synchronous calculation
- `201 Created`: Resource successfully created or assessment generated
- `204 No Content`: Resource successfully deleted
- `400 Bad Request`: Malformed request or semantic validation error
- `404 Not Found`: Requested student, plan, document, or assessment ID does not exist
- `409 Conflict`: Unique constraint violation (e.g. duplicate student email, duplicate lender name)
- `422 Unprocessable Entity`: Request body failed Pydantic schema validation or calculation domain constraint
- `503 Service Unavailable`: Downstream database connectivity failure (returned by `/health/db`)

### 1.2 Error Envelope Format
All `4xx` and `5xx` error responses adhere to FastAPI's standard JSON error structure:

```json
{
  "detail": "Descriptive error explanation"
}
```

For Pydantic validation errors (`422`), `detail` returns an array of field-level validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "tuition_fee"],
      "msg": "Input should be greater than or equal to 0",
      "type": "greater_than_equal"
    }
  ]
}
```

---

## 2. Health & System Status Endpoints

### 2.1 Service Liveness Check
- **Path:** `GET /health` or `GET /api/health` or `GET /api/v1/health`
- **Description:** Verifies the FastAPI web server process is alive and responsive.
- **Request Parameters:** None
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "service": "Finora",
    "version": "1.0.0",
    "environment": "production"
  }
  ```

### 2.2 Database Connectivity Check
- **Path:** `GET /health/db` or `GET /api/health/db` or `GET /api/v1/health/db`
- **Description:** Executes `SELECT 1` against the active database engine to verify connection pooling and table availability.
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "dialect": "sqlite"
  }
  ```
- **Response `503 Service Unavailable`:**
  ```json
  {
    "detail": "Database connection failed: <exception message>"
  }
  ```

---

## 3. Student Applicant Management (`/api/students`)

### 3.1 Create Student Profile
- **Path:** `POST /api/students`
- **Status:** `201 Created`
- **Request Body:**
  ```json
  {
    "name": "Aarav Mehta",
    "email": "aarav.mehta@example.com",
    "country_of_origin": "India",
    "target_country": "USA",
    "target_university": "Carnegie Mellon University",
    "target_course": "MS in Computer Science"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": 1,
    "name": "Aarav Mehta",
    "email": "aarav.mehta@example.com",
    "country_of_origin": "India",
    "target_country": "USA",
    "target_university": "Carnegie Mellon University",
    "target_course": "MS in Computer Science",
    "created_at": "2026-10-09T16:40:00Z",
    "updated_at": "2026-10-09T16:40:00Z"
  }
  ```
- **Errors:** `409 Conflict` (Email already registered).

### 3.2 List All Students
- **Path:** `GET /api/students`
- **Query Parameters:**
  - `skip` (`int`, default `0`): Pagination offset
  - `limit` (`int`, default `100`): Maximum records per page
- **Response `200 OK`:** `list[StudentResponse]`

### 3.3 Get Student by ID
- **Path:** `GET /api/students/{student_id}`
- **Response `200 OK`:** `StudentResponse`
- **Errors:** `404 Not Found`

### 3.4 Update Student Profile
- **Path:** `PUT /api/students/{student_id}` or `PATCH /api/students/{student_id}`
- **Request Body:** Partial `StudentUpdate` object (all fields optional).
- **Response `200 OK`:** Updated `StudentResponse`
- **Errors:** `404 Not Found`, `409 Conflict`

### 3.5 Delete Student Profile
- **Path:** `DELETE /api/students/{student_id}`
- **Status:** `204 No Content`
- **Description:** Cascading delete removes student study plans, funding sources, financial profile, assets, liabilities, collaterals, documents, and historical assessment records.

---

## 4. Study Plans & Cost Calculator (`/api/students/{id}/study-plan`)

### 4.1 Create or Overwrite Study Plan
- **Path:** `POST /api/students/{student_id}/study-plan`
- **Status:** `201 Created`
- **Request Body:**
  ```json
  {
    "tuition_fee": "48000.00",
    "living_expenses": "18000.00",
    "travel_expenses": "2000.00",
    "other_expenses": "1500.00",
    "currency": "USD",
    "duration_months": 24,
    "exchange_rate_to_inr": "85.00"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": 1,
    "student_id": 1,
    "tuition_fee": "48000.00",
    "living_expenses": "18000.00",
    "travel_expenses": "2000.00",
    "other_expenses": "1500.00",
    "currency": "USD",
    "duration_months": 24,
    "exchange_rate_to_inr": "85.00",
    "total_cost_original": "69500.00",
    "total_cost_inr": "5907500.00",
    "created_at": "2026-10-09T16:40:00Z",
    "updated_at": "2026-10-09T16:40:00Z"
  }
  ```

### 4.2 Get Active Study Plan
- **Path:** `GET /api/students/{student_id}/study-plan`
- **Response `200 OK`:** `StudyPlanResponse`
- **Errors:** `404 Not Found`

### 4.3 Update Study Plan
- **Path:** `PATCH /api/students/{student_id}/study-plan`
- **Request Body:** Partial `StudyPlanUpdate` object.
- **Description:** Automatically recomputes `total_cost_original` and `total_cost_inr` upon update.

---

## 5. Funding Sources & Self-Contribution (`/api/students/{id}/funding`)

### 5.1 Add Funding Source
- **Path:** `POST /api/students/{student_id}/funding` (aliases: `/funding-sources`, `/funding_sources`)
- **Status:** `201 Created`
- **Request Body:**
  ```json
  {
    "source_type": "savings",
    "amount_original": "1500000.00",
    "currency": "INR",
    "exchange_rate_to_inr": "1.00",
    "description": "Family Liquid Savings in SBI Account",
    "verified": true
  }
  ```
- **Allowed `source_type` values:** `savings`, `scholarship`, `family_support`, `other`
- **Response `201 Created`:** `FundingSourceResponse`

### 5.2 List Student Funding Sources
- **Path:** `GET /api/students/{student_id}/funding`
- **Response `200 OK`:** `list[FundingSourceResponse]`

### 5.3 Single Funding Source CRUD
- `GET /api/funding/{funding_id}`: Fetch single source
- `PATCH /api/funding/{funding_id}`: Update source and recompute `amount_inr`
- `DELETE /api/funding/{funding_id}`: Delete source (`204 No Content`)

---

## 6. Financial Profiles, Assets & Liabilities

### 6.1 Create or Update Financial Profile
- **Path:** `POST /api/students/{student_id}/financial-profile`
- **Status:** `201 Created`
- **Request Body:**
  ```json
  {
    "monthly_income": "160000.00",
    "existing_monthly_obligations": "8000.00",
    "monthly_living_expenses": "25000.00",
    "requested_loan_amount": "4000000.00",
    "loan_tenure_months": 120,
    "loan_interest_rate": "10.50"
  }
  ```
- **Calculated & Stored Response Attributes:**
  - `proposed_emi`: Deterministically computed monthly EMI in INR
  - `foir`: Ratio of total debt obligations to monthly net income
  - `total_assets_inr`: Sum of all linked candidate assets
  - `total_liabilities_inr`: Sum of all linked outstanding debt
  - `net_worth_inr`: `total_assets_inr - total_liabilities_inr`

### 6.2 Asset Item Endpoints
- `POST /api/students/{student_id}/assets`: Add asset (`asset_type`: `property`, `fixed_deposit`, `mutual_funds`, `shares`, `gold`, `vehicle`, `other`; `is_liquid`: `bool`)
- `GET /api/students/{student_id}/assets`: List student assets
- `PATCH /api/assets/{asset_id}`: Update asset (automatically triggers profile recalculation)
- `DELETE /api/assets/{asset_id}`: Remove asset (`204 No Content`)

### 6.3 Liability Item Endpoints
- `POST /api/students/{student_id}/liabilities`: Add liability (`liability_type`: `home_loan`, `personal_loan`, `car_loan`, `credit_card`, `education_loan`, `other`; `outstanding_amount_inr`, `monthly_emi_inr`)
- `GET /api/students/{student_id}/liabilities`: List student liabilities
- `PATCH /api/liabilities/{liability_id}`: Update liability (triggers profile recalculation)
- `DELETE /api/liabilities/{liability_id}`: Remove liability (`204 No Content`)

---

## 7. Collateral Valuation (`/api/students/{id}/collateral`)

### 7.1 Add Collateral
- **Path:** `POST /api/students/{student_id}/collateral` (aliases: `/collaterals`)
- **Status:** `201 Created`
- **Request Body:**
  ```json
  {
    "collateral_type": "property",
    "ownership_status": "sole",
    "description": "Residential 3BHK Apartment in Pune",
    "market_value_inr": "6000000.00",
    "existing_encumbrance_inr": "0.00"
  }
  ```
- **Allowed `collateral_type`:** `property`, `fixed_deposit`, `gold`, `government_bonds`, `insurance_policy`, `other`
- **Allowed `ownership_status`:** `sole`, `joint_parent`, `joint_third_party`, `third_party`
- **Deterministic Valuation Behavior:** Automatically applies unencumbered deduction and haircut matrix to output `eligible_value_inr`.

### 7.2 Collateral Item Endpoints
- `GET /api/students/{student_id}/collateral`: List all collaterals for student
- `GET /api/collateral/{collateral_id}`: Get single collateral
- `PATCH /api/collateral/{collateral_id}`: Update collateral & re-evaluate eligible value
- `DELETE /api/collateral/{collateral_id}`: Delete collateral (`204 No Content`)

---

## 8. Assessment Orchestrator & Comparison (`/api/assessments`)

### 8.1 Execute Full Assessment
- **Path:** `POST /api/students/{student_id}/assessments` (alias: `/assessment`)
- **Status:** `201 Created`
- **Request Body:**
  ```json
  {
    "requested_loan_amount_inr": null
  }
  ```
  *(Pass `null` to use the deterministically computed funding gap, or specify a custom loan amount).*
- **Response Structure (`FullAssessmentReport`):**
  - `assessment_id` (`int`)
  - `student_id` (`int`)
  - `readiness_score` (`Decimal`: 0.0 to 100.0)
  - `readiness_band` (`str`: "Strong Readiness", "Moderate Readiness", "Conditional Readiness", "High Risk")
  - `financial_summary`: Full breakdown of Study Cost, Funding Gap, Net Worth, EMI, FOIR, and LTV.
  - `lender_matches`: Array of `LenderEvaluationResult` objects (SBI, BOB, BOI, HDFC Credila, Auxilo Finserve) detailing outcome state (`potential_match`, `needs_review`, `not_a_match`), match score, and granular pass/fail reasons.
  - `matching_lenders_count` (`int`)
  - `recommendations`: Actionable steps to remediate identified gaps.

### 8.2 List Historical Assessments
- **Path:** `GET /api/students/{student_id}/assessments`
- **Response `200 OK`:** Chronological history of assessment runs for the student.

### 8.3 Compare Two Historical Assessments
- **Path:** `GET /api/assessments/compare?base_id={id}&target_id={id}`
- **Response `200 OK`:** Metric-by-metric delta comparison (`readiness_score`, `foir`, `funding_gap`, `total_study_cost`) with qualitative summary insight.

---

## 9. Simulator Engine (`/api/simulator`)

### 9.1 Real-Time FOIR Stress Test
- **Path:** `POST /api/simulator/foir`
- **Request Body:**
  ```json
  {
    "monthly_net_income_inr": "120000.00",
    "existing_monthly_emi_inr": "15000.00",
    "loan_amount_inr": "3500000.00",
    "annual_interest_rate_percent": "10.50",
    "tenure_months": 120,
    "other_obligations_inr": "0.00"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "proposed_emi_inr": "47285.34",
    "total_obligations_inr": "62285.34",
    "foir_percentage": "51.90",
    "risk_badge": "moderate_risk",
    "disposable_income_inr": "57714.66",
    "max_affordable_emi_inr": "45000.00",
    "is_affordable": true
  }
  ```

### 9.2 Real-Time Lender Impact Simulation
- **Path:** `POST /api/simulator/lender-impact`
- **Request Body:**
  ```json
  {
    "student_id": 1,
    "simulated_loan_amount_inr": "3000000.00",
    "simulated_tenure_months": 144,
    "simulated_interest_rate": "9.50",
    "additional_collateral_inr": "1000000.00"
  }
  ```
- **Response `200 OK`:** Delta analysis showing lender transitions (e.g. lenders changing from `needs_review` to `potential_match`).

---

## 10. Document Intelligence & Readiness (`/api/documents`)

### 10.1 Upload Document with Magic-Byte Validation
- **Path:** `POST /api/students/{student_id}/documents`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: Binary file upload (`PDF`, `PNG`, `JPEG`; maximum 10 MB)
  - `document_type`: `admission_letter`, `passport`, `academic_transcript`, `salary_slip`, `bank_statement`, `itr`, `property_deed`, `fd_receipt`, `other`
  - `assessment_id` (*optional*): Link document directly to an assessment snapshot.
- **Security Validation:** Rejects disguised executables or files whose internal binary magic bytes do not match declared MIME types.

### 10.2 Document Readiness Assessment
- **Path:** `GET /api/students/{student_id}/documents/readiness`
- **Response `200 OK`:** Readiness checklist matrix verifying mandatory vs optional KYC, academic, and financial documents.

### 10.3 Safe Document File Streaming
- **Path:** `GET /api/documents/{document_id}/preview?download=false`
- **Description:** Streams physical file with `nosniff` headers without revealing server filesystem paths.

### 10.4 Extract Document Data & OCR Evidence
- **Path:** `POST /api/documents/{document_id}/extract`
- **Description:** Parses document text stream and records key-value financial evidence (e.g. university name, declared tuition, verified salary).

### 10.5 Check Income Discrepancies
- **Path:** `GET /api/students/{student_id}/discrepancies?tolerance_percent=10.0`
- **Description:** Compares user-entered monthly income against OCR-extracted figures from salary slips/ITRs. Flags discrepancies exceeding tolerance.

---

## 11. Lender Catalog & Demo Scenarios

### 11.1 List Lenders & Underwriting Criteria
- **Path:** `GET /api/lenders?active_only=true`
- **Description:** Returns all 5 active lenders (SBI, BOB, BOI, HDFC Credila, Auxilo Finserve) and their complete rule criteria trees.

### 11.2 Seed Realistic Demo Scenarios
- **Path:** `POST /api/demo/seed`
- **Status:** `201 Created`
- **Description:** Seeds 5 comprehensive candidate profiles (Aarav Mehta, Priya Sharma, Rohan Verma, Ananya Iyer, Vikram Patel) representing distinct underwriting tiers.
