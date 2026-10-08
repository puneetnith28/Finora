"""Student CRUD API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate

router = APIRouter(prefix="/students", tags=["Students"])


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create student profile",
)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
) -> Student:
    """Create a new student applicant profile."""
    existing = db.query(Student).filter(Student.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student with email '{payload.email}' already exists",
        )

    student = Student(
        name=payload.name,
        email=payload.email,
        country_of_origin=payload.country_of_origin,
        target_country=payload.target_country,
        target_university=payload.target_university,
        target_course=payload.target_course,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get(
    "",
    response_model=list[StudentResponse],
    summary="List all students",
)
def list_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> list[Student]:
    """Retrieve all student profiles with pagination."""
    return db.query(Student).offset(skip).limit(limit).all()


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
    summary="Get student by ID",
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
) -> Student:
    """Fetch a single student profile by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    return student


@router.patch(
    "/{student_id}",
    response_model=StudentResponse,
    summary="Update student profile",
)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
) -> Student:
    """Partially update an existing student profile."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"] != student.email:
        existing = db.query(Student).filter(Student.email == update_data["email"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Student with email '{update_data['email']}' already exists",
            )

    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete student profile",
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a student profile and all associated data."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found",
        )
    db.delete(student)
    db.commit()
