# Finora — Security Architecture & Data Privacy Specification

> **Document Status:** Authoritative Security Specification  
> **Source Modules:** [`backend/app/main.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/main.py), [`backend/app/services/document_service.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/document_service.py), [`backend/app/core/errors.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/core/errors.py), [`backend/tests/test_security.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_security.py)

---

## 1. Threat Model & Security Philosophy

Finora handles sensitive student and co-borrower financial data, including income slips, tax returns (ITR), asset declarations, and loan liability records. The security architecture follows the principle of **defense-in-depth** across network transport, application boundaries, storage isolation, and data presentation:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. TRANSPORT SECURITY: HTTPS / TLS 1.3 + Strict Response Headers       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. INGRESS FILTERING: CORS Origin Whitelist & Pydantic Validation      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. DOCUMENT HARDENING: Magic-Byte Binary Inspection & UUID Sandboxing  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. RUNTIME ISOLATION: Masked Error Envelopes & Zero Stack Trace Leaks  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. DATA PRIVACY: Cascading Deletion & Zero Persistent Third-Party PII  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. HTTP Security Headers

Every HTTP response emitted by the FastAPI backend middleware includes mandatory security headers to prevent clickjacking, MIME-type sniffing, and cross-site scripting:

| Header Name | Configured Value | Security Purpose |
| :--- | :--- | :--- |
| `X-Content-Type-Options` | `nosniff` | Instructs browsers not to override the declared `Content-Type`, preventing malicious file execution disguised as images or text. |
| `X-Frame-Options` | `DENY` | Prevents the application from being embedded in `<iframe>`, `<frame>`, `<embed>`, or `<object>` tags, eliminating clickjacking attack vectors. |
| `X-XSS-Protection` | `1; mode=block` | Enables browser cross-site scripting filters and forces complete page blocking if an XSS attack is detected. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects applicant privacy by sending full referrer paths only to same-origin requests, stripping URL paths on cross-origin requests. |

---

## 3. Cross-Origin Resource Sharing (CORS) Policy

**Module:** [`backend/app/main.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/main.py)

Finora enforces origin filtering at the HTTP server layer:
- **Explicit Allowed Origins:** Populated from `BACKEND_CORS_ORIGINS` (e.g. `https://finora-pi-rust.vercel.app`, `http://localhost:3000`).
- **Localhost Regex Whitelist:** `r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"` permits local development without port locking.
- **Allowed Credentials:** `True` (permits authorization cookies and credentials).
- **Allowed Methods & Headers:** Wildcard `*` for REST standard verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`).

---

## 4. Pre-Underwriting Document Security Controls

**Module:** [`backend/app/services/document_service.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/services/document_service.py)

Uploaded documents undergo a rigorous 4-step security pipeline before being accepted:

```
Uploaded File Stream
         │
         ▼
[ Step 1: Payload Size Check ] ───> Exceeds 10MB? ───> Reject with HTTP 413
         │ (Passes)
         ▼
[ Step 2: File Extension Check ] ──> Not in {.pdf, .jpg, .jpeg, .png}? ──> Reject with HTTP 400
         │ (Passes)
         ▼
[ Step 3: Magic-Byte Binary Header Check ] ──> Bytes != %PDF-, \x89PNG, \xff\xd8\xff? ──> Reject with HTTP 400
         │ (Passes)
         ▼
[ Step 4: Path Sanitization & UUID Storage ] ──> Stored in sandboxed /uploads/{student_id}/{uuid}.ext
```

### 4.1 Magic-Byte Signature Verification
Finora inspects the binary header bytes of all uploaded files rather than trusting user-supplied `Content-Type` headers or file extensions:

```python
MAGIC_SIGNATURES = {
    b"%PDF-": "application/pdf",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
}
```
**Protection:** Blocks polyglot files, executable scripts renamed as `.pdf`, and spoofed image payloads.

### 4.2 Path Traversal Prevention & Sandboxing
- Original filenames are stripped of directories and special characters via `re.sub(r"[^\w\.-]", "_", clean)` and capped at 100 characters.
- Files are saved under randomly generated UUIDs (`uuid.uuid4().hex + ext`) within student-scoped directories (`/uploads/{student_id}/`).
- File retrieval via `/api/documents/{id}/preview` validates that resolved paths remain strictly within `Path(settings.UPLOAD_DIR).resolve()`, raising `403 Forbidden` if path escaping is attempted.

---

## 5. Error Masking & Stack Trace Protection

**Module:** [`backend/app/core/errors.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/core/errors.py)

Finora registers global exception handlers to ensure unhandled backend errors never leak internal stack traces, database schema details, or system file paths to external callers:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

---

## 6. Data Privacy & Student Record Lifecycle

1. **Cascading Deletion:** When a student profile is deleted (`DELETE /api/students/{id}`), all linked assets, liabilities, collaterals, study plans, documents, and historical assessments are permanently purged from the database, and physical files are unlinked from disk.
2. **Zero Third-Party PII Transmission:** Financial calculations (Study Cost, FOIR, LTV, EMI) and lender underwriting rule evaluation execute 100% locally on the backend. No applicant PII or financial figures are transmitted to third-party AI APIs or external cloud analytics.
3. **Audit Trail Snapshots:** Assessment results store immutable point-in-time calculation snapshots in `assessment_results` and `assessment_rule_results`, ensuring historical auditability without recalculation drift.

---

## 7. Security Test Verification

The automated security test suite is located at [`backend/tests/test_security.py`](file:///home/puneetyadav1625/Projects/Finora/backend/tests/test_security.py).

Run the security test suite:
```bash
pytest backend/tests/test_security.py -v
```

**Verified Test Cases:**
- `test_security_response_headers`: Confirms `nosniff`, `DENY`, `1; mode=block`, and `strict-origin-when-cross-origin`.
- `test_cors_headers_allowed_origin`: Confirms CORS preflight response headers for authorized origins.
- `test_unhandled_error_masking`: Confirms stack trace isolation on invalid/unhandled routes.
- `test_document_upload_extension_and_content_sanitization`: Confirms rejection of executable scripts (`.sh`, `.exe`) and files with spoofed extensions failing magic-byte header validation.
