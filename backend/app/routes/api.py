"""API v1 router registry."""

from fastapi import APIRouter

from app.routes.students import router as students_router

api_router = APIRouter()
api_router.include_router(students_router)

