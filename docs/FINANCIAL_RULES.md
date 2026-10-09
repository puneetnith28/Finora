# Finora — Financial Calculation Rules & Underwriting Specification

> **Document Status:** Authoritative Technical Specification  
> **Source Modules:** [`backend/app/services/`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/) (`study_cost_calculator.py`, `funding_calculator.py`, `funding_gap_calculator.py`, `foir_calculator.py`, `emi_calculator.py`, `collateral_calculator.py`, `ltv_calculator.py`, `net_worth_calculator.py`, `rules/lender_evaluator.py`, `db/seed_lenders.py`)  
> **Currency Baseline:** Indian Rupee (INR / ₹) with multi-currency FX normalization  
> **Arithmetic Precision:** Python `Decimal` with two-decimal-place (`0.01`) monetary quantizing and four-decimal-place (`0.0001`) ratio quantizing. Floating-point arithmetic is strictly prohibited in financial persistence layers.

---

## 1. Overview & Computational Philosophy

Finora's underwriting evaluation is completely deterministic. No financial calculation relies on external generative AI, non-deterministic heuristics, or client-side trust. All assessments are performed on the backend using Python's `decimal.Decimal` library to eliminate binary floating-point roundoff errors.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STUDENT & PROGRAM INPUT CONTEXT                      │
│   (Tuition, Living, Travel, Insurance, Duration, Program Currency)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │ 1. Study Cost Calculation Engine│
                    └────────────────┬────────────────┘
                                     ▼
┌────────────────────────────────────┴────────────────────────────────────┐
│                    SELF-FUNDING & SCHOLARSHIP ASSETS                    │
│        (Savings, Deposits, Family Contributions, Scholarships)          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │ 2. Funding Gap & Loan Need      │
                    └────────────────┬────────────────┘
                                     ▼
┌────────────────────────────────────┴────────────────────────────────────┐
│                    COLLATERAL & SPONSOR FINANCIALS                      │
│         (Property, FD, Gold, Co-borrower Income, Obligations)           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
┌───────────┐                  ┌───────────┐                  ┌───────────┐
│  3. FOIR  │                  │  4. LTV   │                  │  5. Net   │
│ Calculator│                  │ Calculator│                  │   Worth   │
└─────┬─────┘                  └─────┬─────┘                  └─────┬─────┘
      │                              │                              │
      └──────────────────────────────┼──────────────────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │ 6. Lender Underwriting Engine   │
                    │    (Criteria & Policy Matching) │
                    └─────────────────────────────────┘
```

---

## 2. Study Cost Calculation Engine

**Module:** [`backend/app/services/study_cost_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/study_cost_calculator.py)

### 2.1 Formula & Computation

The total study cost sums all direct educational and living expenses in the institution's native currency, normalizes the total to INR using the authoritative exchange rate, and calculates annualized values over the course duration.

$$\text{Total Cost}_{\text{orig}} = \text{Tuition} + \text{Living} + \text{Travel} + \text{Insurance} + \text{Other Expenses}$$

$$\text{Total Cost}_{\text{INR}} = \text{quantize}_{0.01}(\text{Total Cost}_{\text{orig}} \times \text{Exchange Rate})$$

$$\text{Duration in Years} = \frac{\text{Duration in Months}}{12}$$

$$\text{Annualized Cost}_{\text{orig}} = \text{quantize}_{0.01}\left(\frac{\text{Total Cost}_{\text{orig}}}{\text{Duration in Years}}\right)$$

$$\text{Annualized Cost}_{\text{INR}} = \text{quantize}_{0.01}\left(\frac{\text{Total Cost}_{\text{INR}}}{\text{Duration in Years}}\right)$$

### 2.2 Input & Output Data Contracts

| Parameter | Type | Constraint | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `tuition_fee` | `Decimal` | $\ge 0.00$ | `0.00` | Program tuition fee in original currency |
| `living_expense` | `Decimal` | $\ge 0.00$ | `0.00` | Living and accommodation expenses |
| `travel_expense` | `Decimal` | $\ge 0.00$ | `0.00` | Airfare, visa, and relocation expenses |
| `insurance_expense`| `Decimal`| $\ge 0.00$ | `0.00` | Mandatory student health insurance |
| `other_expense` | `Decimal` | $\ge 0.00$ | `0.00` | Books, supplies, and miscellaneous fees |
| `duration_months` | `int` | $\ge 1$ | `12` | Total academic duration in months |
| `currency` | `str` | ISO 4217 | `"USD"` | Target country currency code |
| `exchange_rate` | `Decimal` | $> 0.00$ | `85.00` | INR conversion rate per 1 unit of currency |

### 2.3 Edge Cases & Guardrails
- If `duration_months < 12`, annualized cost is proportionally scaled up.
- If all expense inputs are `0.00`, output `total_cost_inr` is `0.00`.
- Negative expenses are rejected at the Pydantic schema validation layer (`ge=0`).

---

## 3. Available Funding & Funding Gap Calculation

**Modules:** [`backend/app/services/funding_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/funding_calculator.py), [`backend/app/services/funding_gap_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/funding_gap_calculator.py)

### 3.1 Aggregation & Conversion

Available self-funding aggregates declared student and family resources, converting non-INR funding sources to INR using declared or default exchange rates.

$$\text{Total Available Funding}_{\text{INR}} = \sum_{i=1}^{k} \text{quantize}_{0.01}(\text{Amount}_i \times \text{Exchange Rate}_i)$$

### 3.2 Funding Gap & Coverage Ratio

$$\text{Net Difference} = \text{Total Study Cost}_{\text{INR}} - \text{Total Available Funding}_{\text{INR}}$$

$$\text{Funding Gap}_{\text{INR}} = \begin{cases} \text{Net Difference}, & \text{if Net Difference} > 0 \\ 0.00, & \text{otherwise} \end{cases}$$

$$\text{Surplus Funding}_{\text{INR}} = \begin{cases} |\text{Net Difference}|, & \text{if Net Difference} < 0 \\ 0.00, & \text{otherwise} \end{cases}$$

$$\text{Coverage Ratio} = \begin{cases} \text{quantize}_{0.0001}\left(\frac{\text{Total Available Funding}_{\text{INR}}}{\text{Total Study Cost}_{\text{INR}}}\right), & \text{if Total Study Cost} > 0 \\ 1.0000, & \text{if Total Study Cost} = 0 \end{cases}$$

$$\text{Recommended Loan Amount}_{\text{INR}} = \text{Funding Gap}_{\text{INR}}$$

### 3.3 Funding Source Categories
- `savings`: Liquid personal or family savings account balances
- `scholarship`: University, government, or private grant awards
- `family_support`: Direct family or relative sponsorship commitments
- `other`: Liquidated assets, gifts, or miscellaneous legal sources

---

## 4. FOIR (Fixed Obligation to Income Ratio) Engine

**Module:** [`backend/app/services/foir_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/foir_calculator.py)

FOIR measures the co-borrower's monthly fixed debt obligations relative to their net monthly take-home income.

### 4.1 Formula

$$\text{Total Monthly Obligations} = \text{Existing EMIs} + \text{Proposed Loan EMI} + \text{Other Fixed Debt}$$

$$\text{FOIR Ratio} = \begin{cases} \text{quantize}_{0.0001}\left(\frac{\text{Total Monthly Obligations}}{\text{Monthly Net Income}}\right), & \text{if Monthly Net Income} > 0 \\ 1.0000, & \text{if Income} = 0 \text{ and Obligations} > 0 \\ 0.0000, & \text{if Income} = 0 \text{ and Obligations} = 0 \end{cases}$$

$$\text{FOIR Percentage} = \text{quantize}_{0.01}(\text{FOIR Ratio} \times 100)$$

$$\text{Disposable Income} = \text{Monthly Net Income} - \text{Total Monthly Obligations}$$

### 4.2 Risk Category Classification & Affordability Rules

| FOIR Percentage Range | Risk Category | Underwriting Interpretation |
| :--- | :--- | :--- |
| $\le 40.00\%$ | `low_risk` | **Optimal Band:** Strong debt-service capacity. Readily approved by all lenders. |
| $40.01\% \dots 60.00\%$ | `moderate_risk` | **Acceptable Band:** Moderate leverage. Meets NBFCs and select PSU bank criteria. |
| $60.01\% \dots 80.00\%$ | `high_risk` | **Stretched Band:** High debt burden. Requires co-borrower addition or collateral security. |
| $> 80.00\%$ | `critical_risk` | **Overleveraged Band:** Exceeds standard prudential limits. High default risk. |

$$\text{is\_affordable} = (\text{Disposable Income} > 0.00) \land (\text{FOIR Percentage} \le 70.00\%)$$

---

## 5. Equated Monthly Installment (EMI) Engine

**Module:** [`backend/app/services/emi_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/emi_calculator.py)

### 5.1 Standard Amortization Formula

The monthly EMI is calculated using standard reducing-balance compound interest:

$$\text{Monthly Interest Rate } r = \frac{\text{Annual Interest Rate Percentage}}{100 \times 12}$$

$$\text{Tenure in Months } n = \text{Tenure Months}$$

$$\text{Monthly EMI} = \begin{cases} \text{quantize}_{0.01}\left(\frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}\right), & \text{if } r > 0 \text{ and } P > 0 \\ \text{quantize}_{0.01}\left(\frac{P}{n}\right), & \text{if } r = 0 \text{ and } P > 0 \\ 0.00, & \text{if } P = 0 \end{cases}$$

$$\text{Total Repayment} = \text{quantize}_{0.01}(\text{Monthly EMI} \times n)$$

$$\text{Total Interest} = \text{quantize}_{0.01}(\text{Total Repayment} - P)$$

$$\text{Interest to Principal Ratio} = \begin{cases} \text{quantize}_{0.0001}\left(\frac{\text{Total Interest}}{P}\right), & \text{if } P > 0 \\ 0.0000, & \text{if } P = 0 \end{cases}$$

### 5.2 Annual Amortization Schedule Generation
For each month $m \in [1, n]$:
1. $\text{Interest}_m = \text{Opening Balance} \times r$
2. $\text{Principal}_m = \min(\text{Opening Balance}, \text{Monthly EMI} - \text{Interest}_m)$
3. $\text{Closing Balance} = \text{Opening Balance} - \text{Principal}_m$
4. Monthly principal and interest components are accumulated into 12-month calendar-year buckets for repayment schedule visualization.

---

## 6. Collateral Valuation & LTV Haircut Engine

**Modules:** [`backend/app/services/collateral_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/collateral_calculator.py), [`backend/app/services/ltv_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/ltv_calculator.py)

### 6.1 Unencumbered Valuation & Prudential Haircuts

$$\text{Unencumbered Value} = \max(0.00, \text{Market Value}_{\text{INR}} - \text{Existing Encumbrance}_{\text{INR}})$$

$$\text{Eligible Collateral Value} = \text{quantize}_{0.01}(\text{Unencumbered Value} \times \text{Haircut Factor} \times \text{Ownership Factor})$$

### 6.2 Standard Asset Haircut Matrix

| Collateral Asset Type (`CollateralType`) | Haircut Factor | Prudential Rationale |
| :--- | :--- | :--- |
| `property` (Residential / Commercial Real Estate) | `0.80` (80%) | 20% standard margin against market volatility and distress liquidation costs |
| `fixed_deposit` (Bank Term Deposits) | `0.90` (90%) | 10% margin to cover premature liquidation penalty and accrued tax |
| `gold` (Gold Jewelry / Sovereign Gold) | `0.75` (75%) | 25% margin aligned with RBI regulatory loan-to-value ceiling for gold |
| `government_bonds` (G-Sec / NSC / RBI Bonds) | `0.85` (85%) | 15% margin against interest-rate cycle fluctuations |
| `insurance_policy` (LIC / Surrender Value) | `0.80` (80%) | 20% margin on certified cash surrender value |
| `other` (Machinery / Vehicles / Other Assets) | `0.50` (50%) | 50% conservative haircut due to rapid depreciation and liquidity friction |

### 6.3 Ownership Eligibility Factors

| Ownership Status (`OwnershipStatus`) | Factor | Underwriting Eligibility |
| :--- | :--- | :--- |
| `sole` | `1.00` | 100% value eligible (applicant or single primary guarantor) |
| `joint_parent` | `1.00` | 100% value eligible (parents as joint owners/guarantors) |
| `third_party` | `0.70` | 70% value eligible (blood relatives acting as third-party guarantors) |
| `joint_third_party` | `0.50` | 50% value eligible (shared title with non-immediate family) |

### 6.4 Loan-To-Value (LTV) Ratio & Coverage Status

$$\text{LTV Ratio} = \begin{cases} \text{quantize}_{0.0001}\left(\frac{\text{Requested Loan Amount}_{\text{INR}}}{\text{Total Eligible Collateral Value}_{\text{INR}}}\right), & \text{if Collateral} > 0 \\ 99.9999, & \text{if Collateral} = 0 \text{ and Loan} > 0 \\ 0.0000, & \text{if Collateral} = 0 \text{ and Loan} = 0 \end{cases}$$

$$\text{LTV Percentage} = \text{quantize}_{0.01}(\text{LTV Ratio} \times 100)$$

$$\text{Collateral Shortfall} = \max(0.00, \text{Requested Loan Amount}_{\text{INR}} - \text{Total Eligible Collateral Value}_{\text{INR}})$$

| LTV Percentage Range | Coverage Status (`coverage_status`) | Security Assessment |
| :--- | :--- | :--- |
| $\le 100.00\%$ | `fully_secured` | Collateral fully covers the requested loan principal. Eligible for secured interest rates. |
| $> 100.00\%$ | `partially_secured` | Collateral provides partial backing; unsecured margin required. |
| Collateral = ₹0.00 | `unsecured` | 100% unsecured loan. Underwriting relies entirely on student merit and co-borrower income. |

---

## 7. Net Worth & Solvency Engine

**Module:** [`backend/app/services/net_worth_calculator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/net_worth_calculator.py)

### 7.1 Asset & Liability Aggregation

$$\text{Total Assets} = \sum \text{Asset Market Values}$$

$$\text{Liquid Assets} = \sum_{\text{is\_liquid}=\text{True}} \text{Asset Market Values}$$

$$\text{Non-Liquid Assets} = \text{Total Assets} - \text{Liquid Assets}$$

$$\text{Total Liabilities} = \sum \text{Liability Outstanding Balances}$$

$$\text{Net Worth} = \text{Total Assets} - \text{Total Liabilities}$$

$$\text{is\_solvent} = \text{Net Worth} \ge 0.00$$

$$\text{Debt-to-Asset Ratio} = \begin{cases} \text{quantize}_{0.0001}\left(\frac{\text{Total Liabilities}}{\text{Total Assets}}\right), & \text{if Total Assets} > 0 \\ 0.0000, & \text{if Total Assets} = 0 \text{ and Liabilities} = 0 \\ 999.9999, & \text{if Total Assets} = 0 \text{ and Liabilities} > 0 \end{cases}$$

---

## 8. Authoritative Lender Underwriting Criteria

**Database Seed File:** [`backend/app/db/seed_lenders.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/db/seed_lenders.py)  
**Evaluation Engine:** [`backend/app/services/rules/lender_evaluator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/rules/lender_evaluator.py)

Finora implements 5 authoritative lenders reflecting the GradGuide benchmark education-loan dataset.

### 8.1 Evaluator Outcome States
- `potential_match`: All hard constraints and review criteria pass ($100\%$ match).
- `needs_review`: Hard constraints pass, but one or more review triggers require manual underwriting inspection.
- `not_a_match`: One or more hard constraints failed (e.g. CIBIL below cutoff, target country outside eligible corridor).

### 8.2 Lender Underwriting Rulebook

#### 1. State Bank of India (SBI) — Public Sector Bank
- **Indicative Rates:** 8.40% (Secured), 9.40% (Unsecured for Top 100 Global Universities).
- **Underwriting Criteria:**
  1. `TARGET_COUNTRY` in `[USA, UK, Canada, Australia, Germany, Ireland, Singapore, France]` (*Hard Constraint, Weight 1.00*)
  2. `MAX_LOAN_AMOUNT` $\le$ ₹1,50,00,000 (₹1.50 Cr) (*Hard Constraint, Weight 1.00*)
  3. `MIN_CIBIL` $\ge 750$ (*Hard Constraint, Weight 1.00*)
  4. `MAX_FOIR` $\le 0.50$ (50%) (*Review Trigger, Weight 0.80*)
  5. `MIN_CO_BORROWER_INCOME` $\ge$ ₹50,000/month (*Preference, Weight 0.70*)

#### 2. Bank of Baroda (BOB) — Public Sector Bank
- **Indicative Rates:** 8.95% (Secured Male), 8.75% (Secured Female), 8.45% (Unsecured Top 100 Universities).
- **Underwriting Criteria:**
  1. `TARGET_COUNTRY` in `[USA, UK, Canada, Australia, Germany, Ireland, Singapore, France]` (*Hard Constraint, Weight 1.00*)
  2. `MAX_LOAN_AMOUNT` $\le$ ₹1,50,00,000 (₹1.50 Cr) (*Hard Constraint, Weight 1.00*)
  3. `MIN_CIBIL` $\ge 700$ (*Hard Constraint, Weight 1.00*)
  4. `MAX_FOIR` $\le 0.55$ (55%) (*Review Trigger, Weight 0.80*)
  5. `MIN_CO_BORROWER_INCOME` $\ge$ ₹45,000/month (*Preference, Weight 0.70*)

#### 3. Bank of India (BOI) — Public Sector Bank
- **Indicative Rates:** 9.00% (Secured Male), 8.60% (Secured Female). Non-collateral loans unavailable.
- **Underwriting Criteria:**
  1. `TARGET_COUNTRY` in `[USA, UK, Canada, Australia, Germany, Ireland, Singapore, France]` (*Hard Constraint, Weight 1.00*)
  2. `MAX_LOAN_AMOUNT` $\le$ ₹1,50,00,000 (₹1.50 Cr) (*Hard Constraint, Weight 1.00*)
  3. `COLLATERAL_REQUIRED` $=$ `true` (*Hard Constraint, Weight 1.00*)
  4. `MIN_CIBIL` $\ge 670$ (*Hard Constraint, Weight 1.00*)
  5. `MAX_FOIR` $\le 0.55$ (55%) (*Review Trigger, Weight 0.75*)

#### 4. HDFC Credila — Education Specialist NBFC
- **Indicative Rates:** 9.25% - 9.75% (Secured), 10.75% (Unsecured).
- **Underwriting Criteria:**
  1. `TARGET_COUNTRY` in `[USA, UK, Canada, Australia, Germany, Ireland, Singapore, France, Netherlands, Sweden]` (*Hard Constraint, Weight 1.00*)
  2. `MAX_LOAN_AMOUNT` $\le$ ₹1,00,00,000 (₹1.00 Cr) (*Hard Constraint, Weight 1.00*)
  3. `MIN_CIBIL` $\ge 680$ (*Hard Constraint, Weight 0.90*)
  4. `MAX_FOIR` $\le 0.60$ (60%) (*Review Trigger, Weight 0.80*)
  5. `MIN_CO_BORROWER_INCOME` $\ge$ ₹35,000/month (*Preference, Weight 0.60*)

#### 5. Auxilo Finserve — Specialist NBFC
- **Indicative Rates:** 10.00% (Secured), 10.25% (Unsecured).
- **Underwriting Criteria:**
  1. `TARGET_COUNTRY` in `[USA, UK, Canada, Australia, Germany, Ireland, Singapore, France, Netherlands]` (*Hard Constraint, Weight 1.00*)
  2. `MAX_LOAN_AMOUNT` $\le$ ₹75,00,000 (₹75 Lakhs) (*Hard Constraint, Weight 1.00*)
  3. `MIN_CIBIL` $\ge 650$ (*Hard Constraint, Weight 0.85*)
  4. `MAX_FOIR` $\le 0.65$ (65%) (*Review Trigger, Weight 0.70*)
  5. `MIN_CO_BORROWER_INCOME` $\ge$ ₹30,000/month (*Preference, Weight 0.60*)

---

## 9. Verification & Test Suite Traceability

All rules and calculations documented above are validated by automated unit and integration tests:

| Calculation Engine | Test Suite File | Test Count | Key Assertion Scenarios |
| :--- | :--- | :--- | :--- |
| **Study Cost** | [`backend/tests/test_study_cost.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_study_cost.py) | 12 tests | Multi-currency conversions, zero-expense boundary, annualization scaling |
| **Funding & Gap** | [`backend/tests/test_funding.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_funding.py) | 15 tests | Multi-source conversion, surplus flooring, zero-cost coverage ratios |
| **FOIR Engine** | [`backend/tests/test_foir.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_foir.py) | 18 tests | 4-tier risk categorisation, zero-income handling, affordability bounds |
| **EMI Amortizer** | [`backend/tests/test_emi.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_emi.py) | 14 tests | Zero interest, zero principal, multi-year schedule continuity |
| **Collateral & LTV**| [`backend/tests/test_collateral.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_collateral.py) | 16 tests | Haircut matrices, encumbrance deductions, joint ownership factors |
| **Lender Matcher** | [`backend/tests/test_lender_evaluator.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_lender_evaluator.py) | 22 tests | Outcome states, hard vs review failures, weighted score math |
