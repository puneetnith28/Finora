"""Tests for CORS policy configuration."""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_cors_allowed_origin():
    """Verify that requests from configured origins are granted CORS headers."""
    transport = ASGITransport(app=app)
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
    }
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.options("/", headers=headers)
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


@pytest.mark.asyncio
async def test_cors_disallowed_origin():
    """Verify that unapproved origins do not receive allow-origin header."""
    transport = ASGITransport(app=app)
    headers = {
        "Origin": "http://malicious-site.com",
        "Access-Control-Request-Method": "GET",
    }
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.options("/", headers=headers)
        assert response.headers.get("access-control-allow-origin") != "http://malicious-site.com"
