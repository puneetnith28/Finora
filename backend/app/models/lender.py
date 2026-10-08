"""Lender and LenderCriterion domain models."""

import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    pass


class CriterionType(enum.StrEnum):
    MIN_CIBIL = "min_cibil"
    MAX_FOIR = "max_foir"
    MAX_LOAN_AMOUNT = "max_loan_amount"
    TARGET_COUNTRY = "target_country"
    MIN_COURSE_LEVEL = "min_course_level"
    COLLATERAL_REQUIRED = "collateral_required"
    MIN_LIQUID_ASSETS_RATIO = "min_liquid_assets_ratio"
    MIN_CO_BORROWER_INCOME = "min_co_borrower_income"
    CUSTOM = "custom"


class CriterionOperator(enum.StrEnum):
    GTE = "gte"
    LTE = "lte"
    EQ = "eq"
    NEQ = "neq"
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"


class Lender(Base):
    __tablename__ = "lenders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    criteria: Mapped[list["LenderCriterion"]] = relationship(
        "LenderCriterion", back_populates="lender", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Lender(id={self.id}, name='{self.name}', active={self.active})>"


class LenderCriterion(Base):
    __tablename__ = "lender_criteria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lender_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lenders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criterion_type: Mapped[CriterionType] = mapped_column(
        Enum(CriterionType, native_enum=False, length=50), nullable=False
    )
    operator: Mapped[CriterionOperator] = mapped_column(
        Enum(CriterionOperator, native_enum=False, length=20),
        nullable=False,
        default=CriterionOperator.GTE,
    )
    threshold_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    threshold_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("1.00"), nullable=False)
    configuration_json: Mapped[str | None] = mapped_column(Text, nullable=True)

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
    lender: Mapped["Lender"] = relationship(back_populates="criteria")

    def __repr__(self) -> str:
        return (
            f"<LenderCriterion(id={self.id}, lender_id={self.lender_id}, "
            f"type='{self.criterion_type.value}', operator='{self.operator.value}')>"
        )
