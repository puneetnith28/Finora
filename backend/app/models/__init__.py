"""Domain models package."""

from app.db.base import Base
from app.models.student import Student
from app.models.study_plan import StudyPlan

__all__ = ["Base", "Student", "StudyPlan"]
