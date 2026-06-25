from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, Gender, StudentStatus


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.user


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    avatar: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    avatar: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Department Schemas ──────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Course Schemas ──────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    name: str
    code: str
    credits: int = 3
    department_id: int


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    credits: Optional[int] = None
    department_id: Optional[int] = None


class CourseOut(BaseModel):
    id: int
    name: str
    code: str
    credits: int
    department_id: int
    department: Optional[DepartmentOut]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Student Schemas ─────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    enrollment_year: Optional[int] = None
    status: StudentStatus = StudentStatus.active
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    notes: Optional[str] = None


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    enrollment_year: Optional[int] = None
    status: Optional[StudentStatus] = None
    gpa: Optional[float] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    notes: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    student_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    date_of_birth: Optional[str]
    gender: Optional[Gender]
    address: Optional[str]
    department_id: Optional[int]
    department: Optional[DepartmentOut]
    enrollment_year: Optional[int]
    status: StudentStatus
    gpa: float
    avatar: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Grade Schemas ───────────────────────────────────────────────────────────

class GradeCreate(BaseModel):
    student_id: int
    course_id: int
    semester: str
    year: int
    marks: float
    grade_letter: Optional[str] = None


class GradeOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    semester: str
    year: int
    marks: float
    grade_letter: Optional[str]
    course: Optional[CourseOut]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ───────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_students: int
    active_students: int
    total_departments: int
    total_courses: int
    total_users: int
    avg_gpa: float
    recent_enrollments: int


# ─── Audit Log ───────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity: str
    entity_id: Optional[int]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    user: Optional[UserOut]

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
