# Security Policy — Finora

Finora is dedicated to maintaining strict computational accuracy, data integrity, and privacy standards for all education loan assessment operations. We appreciate responsible disclosures of security vulnerabilities.

---

## 1. Supported Versions

Security updates are actively applied and tested against the following branches and releases:

| Version / Branch | Supported | Notes |
| :--- | :---: | :--- |
| `main` (Latest Development) | ✅ Yes | Receives continuous security updates and Dependabot scans. |
| Production Deployments (`Vercel` / `Render`) | ✅ Yes | Production environments are kept synced with `main`. |
| Historical Releases / Archived Branches | ❌ No | Please upgrade to the latest `main` commit. |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability or potential threat in Finora, please report it privately:

1. **GitHub Private Security Advisory (Recommended):**
   - Navigate to the repository's **Security** tab on GitHub $\rightarrow$ **Report a vulnerability**.
   - Provide a detailed description, reproduction steps or Proof-of-Concept (PoC), and potential impact.
2. **Do Not Open Public Issues:**
   - **⚠️ Warning:** Never publish vulnerability details, exploit scripts, API keys, passwords, database credentials, or sensitive student financial data in public GitHub issues, pull request descriptions, or discussion forums.
3. **Response Timeline:**
   - Initial triage and acknowledgment will be provided within **48 hours**.
   - A remediation timeline or patch will follow upon confirmation of the issue.

---

## 3. Handling Compromised Secrets or API Keys

If you accidentally commit or expose an API key, session secret, or cloud credential:

1. **Immediate Revocation:** Immediately revoke/rotate the affected key in the corresponding provider console (e.g., Vercel, Render, ElevenLabs, Database provider).
2. **Purge Commit History:** Use `git filter-repo` or BFG Repo-Cleaner to permanently scrub the sensitive string from Git commit history. A simple `git revert` or followup commit does **not** erase credentials from Git history.
3. **Notify Maintainers:** If production tokens or production databases were exposed, notify repository maintainers immediately so audit logs and access logs can be inspected.

---

## 4. Security Architecture & Invariants

Finora implements several built-in security layers:
- **Server-Side Financial Math:** All financial calculations (Study Costs, FOIR, EMI, LTV, Lender Underwriting) execute strictly server-side using Python `decimal.Decimal` to prevent tampering.
- **Pre-Underwriting Document Sandboxing:** Uploaded documents undergo MIME magic-byte binary header inspection, file extension whitelisting, UUID isolation, and 10 MB upload limits.
- **Security Response Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Database Cascade Controls:** Indexed lookups and cascade constraints prevent orphaned financial records.
