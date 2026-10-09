"""Finora FastAPI Application Entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 - Register all models with Base.metadata
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.db.base import Base
from app.db.seed_lenders import seed_demo_lenders
from app.db.session import SessionLocal, engine
from app.routes.api import api_router
from app.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables and seed demo lenders on startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_lenders(db)
    finally:
        db.close()
    yield
    # Shutdown actions


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Register custom error formatting
register_error_handlers(app)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS or ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Mount Health check endpoints (root & API levels)
app.include_router(health_router)
app.include_router(health_router, prefix=settings.API_V1_STR)

# Include API Routers
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }
