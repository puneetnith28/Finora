"""Student domain model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.study_plan import StudyPlan


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    country_of_origin: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    target_country: Mapped[str] = mapped_column(String(100), nullable=False)
    target_university: Mapped[str] = mapped_column(String(255), nullable=False)
    target_course: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    study_plan: Mapped["StudyPlan | None"] = relationship(
        "StudyPlan", back_populates="student", cascade="all, delete-orphan", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, name='{self.name}', email='{self.email}')>"
