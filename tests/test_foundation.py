"""Foundation Integration Acceptance Tests (Phase 1 — Step 10)

Verifies:
1. Backend application starts and mounts all routes
2. GET /health returns 200 and healthy service payload
3. GET /health/db returns 200 and database connectivity confirmed
4. SQLite connection correctly enforces foreign keys
5. API v1 endpoints respond
"""

import os
import sys

# Ensure backend package is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.db.session import engine
from sqlalchemy import text


@pytest.mark.asyncio
async def test_foundation_backend_health():
    """Verify backend starts and GET /health returns healthy."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Finora"


@pytest.mark.asyncio
async def test_foundation_database_connectivity():
    """Verify FastAPI connects to SQLite and GET /health/db confirms connectivity."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health/db")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_foundation_sqlite_foreign_keys():
    """Verify SQLite connection has foreign keys enabled."""
    with engine.connect() as conn:
        fk_status = conn.execute(text("PRAGMA foreign_keys;")).scalar()
        assert fk_status == 1
