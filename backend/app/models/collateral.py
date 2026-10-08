"""Collateral domain model."""

import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.student import Student


class CollateralType(enum.StrEnum):
    PROPERTY = "property"
    FIXED_DEPOSIT = "fixed_deposit"
    GOLD = "gold"
    GOVERNMENT_BONDS = "government_bonds"
    INSURANCE_POLICY = "insurance_policy"
    OTHER = "other"


class OwnershipStatus(enum.StrEnum):
    SOLE = "sole"
    JOINT_PARENT = "joint_parent"
    JOINT_THIRD_PARTY = "joint_third_party"
    THIRD_PARTY = "third_party"


class Collateral(Base):
    __tablename__ = "collaterals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    asset_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True
    )
    collateral_type: Mapped[CollateralType] = mapped_column(
        Enum(CollateralType, native_enum=False, length=50), nullable=False
    )
    ownership_status: Mapped[OwnershipStatus] = mapped_column(
        Enum(OwnershipStatus, native_enum=False, length=50),
        nullable=False,
        default=OwnershipStatus.SOLE,
    )
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    market_value_inr: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    existing_encumbrance_inr: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    eligible_value_inr: Mapped[Decimal] = mapped_column(
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
    student: Mapped["Student"] = relationship(back_populates="collaterals")
    asset: Mapped["Asset | None"] = relationship()

    def __repr__(self) -> str:
        return (
            f"<Collateral(id={self.id}, student_id={self.student_id}, "
            f"type='{self.collateral_type.value}', market_value={self.market_value_inr}, "
            f"eligible_value={self.eligible_value_inr})>"
        )
