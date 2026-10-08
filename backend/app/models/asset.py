"""Asset domain model."""

import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.student import Student


class AssetType(enum.StrEnum):
    SAVINGS_DEPOSIT = "savings_deposit"
    SAVINGS_ACCOUNT = "savings_account"
    FIXED_DEPOSIT = "fixed_deposit"
    MUTUAL_FUNDS = "mutual_funds"
    STOCKS = "stocks"
    PROPERTY = "property"
    RESIDENTIAL_PROPERTY = "residential_property"
    COMMERCIAL_PROPERTY = "commercial_property"
    GOLD = "gold"
    PROVIDENT_FUND = "provident_fund"
    OTHER = "other"


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    asset_type: Mapped[AssetType] = mapped_column(
        Enum(AssetType, native_enum=False, length=50), nullable=False
    )
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    estimated_value_inr: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    is_liquid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

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
    student: Mapped["Student"] = relationship(back_populates="assets")

    def __repr__(self) -> str:
        return (
            f"<Asset(id={self.id}, student_id={self.student_id}, "
            f"type='{self.asset_type.value}', value_inr={self.estimated_value_inr}, liquid={self.is_liquid})>"
        )
