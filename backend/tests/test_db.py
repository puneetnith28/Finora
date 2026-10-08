"""Tests for SQLite configuration and session management."""

import pytest
from sqlalchemy import ForeignKey, Integer, String, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.session import SessionLocal, engine, get_db


class ParentTestModel(Base):
    __tablename__ = "parent_test_model"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))


class ChildTestModel(Base):
    __tablename__ = "child_test_model"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    parent_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("parent_test_model.id", ondelete="CASCADE")
    )


def test_sqlite_foreign_keys_enabled():
    """Verify that PRAGMA foreign_keys is ON in SQLite connections."""
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA foreign_keys;")).scalar()
        assert result == 1


def test_sqlite_foreign_key_enforcement():
    """Verify that foreign key constraints are strictly enforced by SQLite."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Inserting a child with a non-existent parent_id should fail
        invalid_child = ChildTestModel(parent_id=999999)
        db.add(invalid_child)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()

        # Inserting a parent and child should succeed
        parent = ParentTestModel(name="Test Parent")
        db.add(parent)
        db.commit()
        db.refresh(parent)

        valid_child = ChildTestModel(parent_id=parent.id)
        db.add(valid_child)
        db.commit()
        db.refresh(valid_child)

        assert valid_child.id is not None
        assert valid_child.parent_id == parent.id
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_get_db_dependency():
    """Verify that the get_db generator yields and closes a valid session."""
    gen = get_db()
    session = next(gen)
    assert session is not None
    assert session.is_active
    try:
        pass
    finally:
        with pytest.raises(StopIteration):
            next(gen)
