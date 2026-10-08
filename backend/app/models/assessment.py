"""Assessment domain models and evaluation history."""

import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.lender import Lender, LenderCriterion
    from app.models.student import Student


class AssessmentStatus(enum.StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_loan_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    status: Mapped[AssessmentStatus] = mapped_column(
        Enum(AssessmentStatus, native_enum=False, length=50),
        nullable=False,
        default=AssessmentStatus.PENDING,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="assessments")
    results: Mapped[list["AssessmentResult"]] = relationship(
        "AssessmentResult", back_populates="assessment", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<Assessment(id={self.id}, student_id={self.student_id}, "
            f"status='{self.status.value}', requested={self.requested_loan_amount})>"
        )


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    total_study_cost: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    available_funding: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    funding_gap: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    net_worth: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.0")
    )
    foir: Mapped[Decimal] = mapped_column(Numeric(6, 4), nullable=False, default=Decimal("0.0"))
    ltv: Mapped[Decimal] = mapped_column(Numeric(6, 4), nullable=False, default=Decimal("0.0"))
    readiness_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False, default=Decimal("0.0")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship(back_populates="results")
    rule_results: Mapped[list["AssessmentRuleResult"]] = relationship(
        "AssessmentRuleResult",
        back_populates="assessment_result",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<AssessmentResult(id={self.id}, assessment_id={self.assessment_id}, "
            f"score={self.readiness_score}, gap={self.funding_gap})>"
        )


class AssessmentRuleResult(Base):
    __tablename__ = "assessment_rule_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assessment_result_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assessment_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lender_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lenders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criterion_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("lender_criteria.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    actual_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expected_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    assessment_result: Mapped["AssessmentResult"] = relationship(back_populates="rule_results")
    lender: Mapped["Lender"] = relationship()
    criterion: Mapped["LenderCriterion | None"] = relationship()

    def __repr__(self) -> str:
        return (
            f"<AssessmentRuleResult(id={self.id}, lender_id={self.lender_id}, "
            f"passed={self.passed})>"
        )
