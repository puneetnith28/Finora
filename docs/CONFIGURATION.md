# Finora — Environment Configuration & Runtime Settings

> **Document Status:** Authoritative Technical Specification  
> **Target Audiences:** DevOps Engineers, Backend Engineers, Frontend Engineers  
> **Source Modules:** [`backend/app/core/config.py`](file:///home/puneetyadav1625/Projects/Finora/backend/app/core/config.py), [`next.config.ts`](file:///home/puneetyadav1625/Projects/Finora/next.config.ts), [`docker-compose.yml`](file:///home/puneetyadav1625/Projects/Finora/docker-compose.yml)

---

## 1. Architectural Configuration Model

Finora maintains strict separation between client-side and server-side runtime configuration:

```
┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
│           NEXT.JS FRONTEND             │       │            FASTAPI BACKEND             │
│        (Vercel / Port 3000)            │       │          (Render / Port 8000)          │
├────────────────────────────────────────┤       ├────────────────────────────────────────┤
│ • NEXT_PUBLIC_API_URL                  │       │ • DATABASE_URL                         │
│ • NODE_ENV                             │       │ • ENVIRONMENT                          │
│ • PORT (Default: 3000)                 │       │ • BACKEND_CORS_ORIGINS                 │
│                                        │       │ • UPLOAD_DIR                           │
│ (Rewrites /api/* to backend URL)       │       │ • MAX_UPLOAD_SIZE                      │
└────────────────────────────────────────┘       └────────────────────────────────────────┘
```

---

## 2. Backend Environment Variables (`backend/.env`)

The backend engine parses configuration via Pydantic's `BaseSettings` (`pydantic-settings`). Values are loaded from environment variables or a local `.env` file with case sensitivity enabled.

| Variable Name | Type | Default Value | Production Example | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `PROJECT_NAME` | `str` | `"Finora"` | `"Finora"` | Service identifier displayed in OpenAPI docs and health endpoints. |
| `VERSION` | `str` | `"0.1.0"` | `"1.0.0"` | Semantic version string. |
| `API_V1_STR` | `str` | `"/api/v1"` | `"/api/v1"` | Versioned API route prefix. |
| `ENVIRONMENT` | `str` | `"development"` | `"production"` | Runtime environment tag (`development`, `staging`, `production`, `test`). |
| `DATABASE_URL` | `str` | `"sqlite:///./finora.db"` | `"sqlite:///./finora.db"` | SQLAlchemy database connection URI. Supports SQLite and PostgreSQL (`postgresql+psycopg2://user:pass@host:5432/dbname`). |
| `BACKEND_CORS_ORIGINS` | `str` \| `list[str]` | `["http://localhost:3000", "http://127.0.0.1:3000"]` | `["https://finora-pi-rust.vercel.app","http://localhost:3000"]` | Allowed HTTP origins for CORS pre-flight checks. Supports comma-separated strings (`"url1,url2"`) or JSON arrays (`'["url1","url2"]'`). |
| `UPLOAD_DIR` | `str` | `"./uploads"` | `"/app/uploads"` | Sandboxed filesystem directory for physical document storage. Parent directories are created automatically if missing. |
| `MAX_UPLOAD_SIZE` | `int` | `10485760` (10 MB) | `10485760` | Maximum allowable file payload in bytes. Uploads exceeding this threshold are rejected immediately before disk I/O. |

### 2.1 Backend CORS Origin Parsing Rules

`BACKEND_CORS_ORIGINS` uses a custom Pydantic validator (`assemble_cors_origins` in `app.core.config.py`):
1. **String format (comma-separated):** `"https://app.finora.com,https://finora-pi-rust.vercel.app"` $\rightarrow$ parsed into `["https://app.finora.com", "https://finora-pi-rust.vercel.app"]`.
2. **JSON array format:** `'["https://app.finora.com"]'` $\rightarrow$ parsed into list of strings.
3. **Fallback:** If parsing fails or input is empty, defaults safely to `["http://localhost:3000", "http://127.0.0.1:3000"]`.
4. **Localhost regex:** In addition to explicit origins, the FastAPI CORS middleware always matches `r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"` to prevent local development port conflicts.

---

## 3. Frontend Environment Variables (`.env.local` / Vercel)

Next.js variables prefixed with `NEXT_PUBLIC_` are inlined during build time into the client JavaScript bundle.

| Variable Name | Type | Default Value | Production (Vercel) Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `str` | `"http://localhost:8000"` | `"https://finora-backend-7pe7.onrender.com"` | Authoritative backend API base URL used by Next.js server rewrites and client fetch requests. Trailing slashes are stripped automatically. |
| `NODE_ENV` | `str` | `"development"` | `"production"` | Node.js execution mode. |
| `PORT` | `int` | `3000` | `3000` | Local development server port. |

### 3.1 Next.js API Rewrite Proxying (`next.config.ts`)

Next.js implements server-side reverse proxying for all `/api/:path*` requests:
```typescript
const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

// In nextConfig:
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```
**Benefits:**
- Eliminates client-side cross-origin browser issues by serving API requests from the same origin (`/api/...`).
- Automatically routes `/api/students`, `/api/assessments`, and `/api/documents` to the configured Render backend.

---

## 4. Docker & Multi-Container Compose Configuration

**File:** [`docker-compose.yml`](file:///home/puneetyadav1625/Projects/Finora/docker-compose.yml)

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: finora-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./finora.db
      - ENVIRONMENT=production
      - BACKEND_CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
      - UPLOAD_DIR=/app/uploads
      - MAX_UPLOAD_SIZE=10485760
    volumes:
      - finora_uploads:/app/uploads
      - finora_data:/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finora-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      backend:
        condition: service_healthy
```

---

## 5. Deployment Environment Matrix

| Deployment Target | Service | Host Provider | Configured Environment Variables |
| :--- | :--- | :--- | :--- |
| **Production Frontend** | Next.js 16.4 | Vercel (`finora-pi-rust.vercel.app`) | `NEXT_PUBLIC_API_URL=https://finora-backend-7pe7.onrender.com` |
| **Production Backend** | FastAPI 0.115 | Render (`finora-backend-7pe7.onrender.com`) | `ENVIRONMENT=production`, `BACKEND_CORS_ORIGINS=["https://finora-pi-rust.vercel.app","http://localhost:3000"]`, `UPLOAD_DIR=./uploads` |
| **Local Development** | Full Stack | Local Machine | Frontend: `NEXT_PUBLIC_API_URL=http://localhost:8000`<br>Backend: `DATABASE_URL=sqlite:///./finora.db` |
| **Docker Compose** | Multi-container | Local / VM Docker Engine | Inter-service container networking via `service_healthy` dependencies. |

---

## 6. Secrets & Security Handling Rules

1. **Zero Hardcoded Secrets:** No API tokens, database passwords, or private encryption keys are committed to Git.
2. **Gitignore Protections:** `.env`, `.env.local`, `.env.production`, `*.db`, and `uploads/` are explicitly ignored in `.gitignore`.
3. **Template Provided:** Baseline environment defaults are documented in `backend/.env.example`.
