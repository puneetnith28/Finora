"""FundingSource domain model."""

import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.student import Student


class FundingSourceType(enum.StrEnum):
    SAVINGS = "savings"
    SCHOLARSHIP = "scholarship"
    SPONSORSHIP = "sponsorship"
    FAMILY_CONTRIBUTION = "family_contribution"
    FAMILY_SUPPORT = "family_support"
    FIXED_DEPOSIT = "fixed_deposit"
    PROVIDENT_FUND = "provident_fund"
    FEES_PAID = "fees_paid"
    FEES_ALREADY_PAID = "fees_already_paid"
    EDUCATION_GRANT = "education_grant"
    OTHER = "other"


class FundingSource(Base):
    __tablename__ = "funding_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_type: Mapped[FundingSourceType] = mapped_column(
        Enum(FundingSourceType, native_enum=False, length=50), nullable=False
    )
    amount_original: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="INR")
    exchange_rate_to_inr: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), nullable=False, default=Decimal("1.00")
    )
    amount_inr: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

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
    student: Mapped["Student"] = relationship(back_populates="funding_sources")

    def __repr__(self) -> str:
        return (
            f"<FundingSource(id={self.id}, student_id={self.student_id}, "
            f"type='{self.source_type.value}', amount_inr={self.amount_inr}, verified={self.verified})>"
        )
