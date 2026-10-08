"""Health check endpoints for service and database status."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    """Basic service liveness check."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/db")
def get_db_health(db: Session = Depends(get_db)):
    """Database connectivity and readiness check."""
    try:
        result = db.execute(text("SELECT 1")).scalar()
        if result != 1:
            raise Exception("Unexpected query result")
        return {
            "status": "healthy",
            "database": "connected",
            "dialect": db.bind.dialect.name if db.bind else "unknown",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(exc)}",
        ) from exc
