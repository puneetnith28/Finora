"""StudyPlan domain model."""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.student import Student


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    tuition_fee: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    living_expenses: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    travel_expenses: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    other_expenses: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    duration_months: Mapped[int] = mapped_column(Integer, nullable=False, default=24)
    exchange_rate_to_inr: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), nullable=False, default=Decimal("83.50")
    )
    total_cost_original: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    total_cost_inr: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )

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
    student: Mapped["Student"] = relationship(back_populates="study_plan")

    def __repr__(self) -> str:
        return (
            f"<StudyPlan(id={self.id}, student_id={self.student_id}, "
            f"currency='{self.currency}', total_cost_inr={self.total_cost_inr})>"
        )
