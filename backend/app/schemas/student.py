"""Student Pydantic validation schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Full name of student")
    email: EmailStr = Field(..., description="Unique email address")
    country_of_origin: str = Field(default="India", min_length=1, max_length=100)
    target_country: str = Field(..., min_length=1, max_length=100)
    target_university: str = Field(..., min_length=1, max_length=255)
    target_course: str = Field(..., min_length=1, max_length=255)


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    email: EmailStr | None = None
    country_of_origin: str | None = Field(None, min_length=1, max_length=100)
    target_country: str | None = Field(None, min_length=1, max_length=100)
    target_university: str | None = Field(None, min_length=1, max_length=255)
    target_course: str | None = Field(None, min_length=1, max_length=255)


class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
