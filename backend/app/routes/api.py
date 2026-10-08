"""API v1 router registry."""

from fastapi import APIRouter

from app.routes.financial_profiles import (
    asset_item_router,
    financial_profile_router,
    liability_item_router,
)
from app.routes.funding import funding_item_router, student_funding_router
from app.routes.students import router as students_router
from app.routes.study_plans import router as study_plans_router

api_router = APIRouter()
api_router.include_router(students_router)
api_router.include_router(study_plans_router)
api_router.include_router(student_funding_router)
api_router.include_router(funding_item_router)
api_router.include_router(financial_profile_router)
api_router.include_router(asset_item_router)
api_router.include_router(liability_item_router)





