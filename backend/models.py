from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    user = "user"


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class StudentStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    graduated = "graduated"
    suspended = "suspended"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    audit_logs = relationship("AuditLog", back_populates="user")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    students = relationship("Student", back_populates="department")
    courses = relationship("Course", back_populates="department")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    credits = Column(Integer, default=3)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    department = relationship("Department", back_populates="courses")
    grades = relationship("Grade", back_populates="course")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(20), unique=True, index=True, nullable=False)
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    gender = Column(SAEnum(Gender), nullable=True)
    address = Column(Text, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    enrollment_year = Column(Integer, nullable=True)
    status = Column(SAEnum(StudentStatus), default=StudentStatus.active)
    gpa = Column(Float, default=0.0)
    avatar = Column(String(255), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    department = relationship("Department", back_populates="students")
    grades = relationship("Grade", back_populates="student")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    semester = Column(String(20), nullable=False)
    year = Column(Integer, nullable=False)
    marks = Column(Float, nullable=False)
    grade_letter = Column(String(5), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="grades")
    course = relationship("Course", back_populates="grades")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)
    entity = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")