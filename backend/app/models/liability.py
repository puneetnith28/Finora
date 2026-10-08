"""Liability domain model."""

import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.student import Student


class LiabilityType(enum.StrEnum):
    HOME_LOAN = "home_loan"
    PERSONAL_LOAN = "personal_loan"
    EDUCATION_LOAN = "education_loan"
    CREDIT_CARD = "credit_card"
    VEHICLE_LOAN = "vehicle_loan"
    AUTO_LOAN = "auto_loan"
    CAR_LOAN = "car_loan"
    BUSINESS_LOAN = "business_loan"
    OTHER = "other"


class Liability(Base):
    __tablename__ = "liabilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    liability_type: Mapped[LiabilityType] = mapped_column(
        Enum(LiabilityType, native_enum=False, length=50), nullable=False
    )
    lender_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    outstanding_amount_inr: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    monthly_emi_inr: Mapped[Decimal] = mapped_column(
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
    student: Mapped["Student"] = relationship(back_populates="liabilities")

    def __repr__(self) -> str:
        return (
            f"<Liability(id={self.id}, student_id={self.student_id}, "
            f"type='{self.liability_type.value}', outstanding={self.outstanding_amount_inr}, emi={self.monthly_emi_inr})>"
        )
