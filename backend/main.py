from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv

from database import engine, get_db, Base
import models, schemas
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_admin, require_super_admin, ACCESS_TOKEN_EXPIRE_MINUTES
)

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student DBMS API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
SERVE_FRONTEND = os.path.exists(FRONTEND_DIST)


# ─── Seed Super Admin on Startup ─────────────────────────────────────────────

@app.on_event("startup")
def seed_admin():
    db = next(get_db())
    admin_email = os.getenv("ADMIN_EMAIL", "admin@school.edu")
    existing = db.query(models.User).filter(models.User.email == admin_email).first()
    if not existing:
        admin = models.User(
            name=os.getenv("ADMIN_NAME", "Super Admin"),
            email=admin_email,
            hashed_password=get_password_hash(os.getenv("ADMIN_PASSWORD", "Admin@123456")),
            role=models.UserRole.super_admin,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"✅ Super Admin seeded: {admin_email}")


def log_action(db: Session, user_id: Optional[int], action: str, entity: str,
               entity_id: Optional[int] = None, details: Optional[str] = None,
               ip: Optional[str] = None):
    log = models.AuditLog(
        user_id=user_id, action=action, entity=entity,
        entity_id=entity_id, details=details, ip_address=ip
    )
    db.add(log)
    db.commit()


# ─── Auth Routes ─────────────────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    token = create_access_token({"sub": user.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.put("/api/auth/change-password")
def change_password(
    data: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


# ─── Dashboard ───────────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    avg_gpa = db.query(func.avg(models.Student.gpa)).scalar() or 0.0
    return {
        "total_students": db.query(models.Student).count(),
        "active_students": db.query(models.Student).filter(models.Student.status == "active").count(),
        "total_departments": db.query(models.Department).count(),
        "total_courses": db.query(models.Course).count(),
        "total_users": db.query(models.User).count(),
        "avg_gpa": round(avg_gpa, 2),
        "recent_enrollments": db.query(models.Student).filter(
            models.Student.created_at >= thirty_days_ago
        ).count(),
    }


# ─── Users (Role-Based RBAC) ─────────────────────────────────────────────────

@app.get("/api/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    if current_user.role == models.UserRole.super_admin:
        return db.query(models.User).all()
    return db.query(models.User).filter(models.User.role != models.UserRole.super_admin).all()


@app.post("/api/users", response_model=schemas.UserOut)
def create_user(data: schemas.UserCreate, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    if data.role == models.UserRole.admin and current_user.role != models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin can create admins")
    if data.role == models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Cannot create another Super Admin")
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(name=data.name, email=data.email, hashed_password=get_password_hash(data.password), role=data.role)
    db.add(user); db.commit(); db.refresh(user)
    log_action(db, current_user.id, "CREATE", "User", user.id, f"Created {user.role} {user.email}", request.client.host)
    return user


@app.put("/api/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, data: schemas.UserUpdate, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == models.UserRole.super_admin and current_user.id != target.id:
        raise HTTPException(status_code=403, detail="Cannot edit Super Admin")
    if target.role == models.UserRole.admin and current_user.role != models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin can edit admins")
    if data.role == models.UserRole.admin and current_user.role != models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin can promote to admin")
    if data.role == models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Cannot assign Super Admin role")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(target, field, value)
    db.commit(); db.refresh(target)
    log_action(db, current_user.id, "UPDATE", "User", target.id, f"Updated {target.email}", request.client.host)
    return target


@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if target.role == models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Super Admin cannot be deleted")
    if target.role == models.UserRole.admin and current_user.role != models.UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin can delete admins")
    db.delete(target); db.commit()
    log_action(db, current_user.id, "DELETE", "User", user_id, f"Deleted {target.email}", request.client.host)
    return {"message": "User deleted"}


# ─── Departments ─────────────────────────────────────────────────────────────

@app.get("/api/departments", response_model=List[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Department).all()


@app.post("/api/departments", response_model=schemas.DepartmentOut)
def create_department(data: schemas.DepartmentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    dept = models.Department(**data.model_dump())
    db.add(dept); db.commit(); db.refresh(dept)
    return dept


@app.put("/api/departments/{dept_id}", response_model=schemas.DepartmentOut)
def update_department(dept_id: int, data: schemas.DepartmentUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(dept, field, value)
    db.commit(); db.refresh(dept)
    return dept


@app.delete("/api/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept); db.commit()
    return {"message": "Department deleted"}


# ─── Courses ─────────────────────────────────────────────────────────────────

@app.get("/api/courses", response_model=List[schemas.CourseOut])
def list_courses(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Course).all()


@app.post("/api/courses", response_model=schemas.CourseOut)
def create_course(data: schemas.CourseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    course = models.Course(**data.model_dump())
    db.add(course); db.commit(); db.refresh(course)
    return course


@app.put("/api/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(course_id: int, data: schemas.CourseUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    db.commit(); db.refresh(course)
    return course


@app.delete("/api/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course); db.commit()
    return {"message": "Course deleted"}


# ─── Students ────────────────────────────────────────────────────────────────

@app.get("/api/students", response_model=List[schemas.StudentOut])
def list_students(search: Optional[str] = None, department_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(models.Student)
    if search:
        q = q.filter(models.Student.first_name.ilike(f"%{search}%") | models.Student.last_name.ilike(f"%{search}%") | models.Student.email.ilike(f"%{search}%") | models.Student.student_id.ilike(f"%{search}%"))
    if department_id:
        q = q.filter(models.Student.department_id == department_id)
    if status:
        q = q.filter(models.Student.status == status)
    return q.order_by(models.Student.created_at.desc()).all()


@app.get("/api/students/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/api/students", response_model=schemas.StudentOut)
def create_student(data: schemas.StudentCreate, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if db.query(models.Student).filter(models.Student.email == data.email).first():
        raise HTTPException(status_code=400, detail="Student email already exists")
    if db.query(models.Student).filter(models.Student.student_id == data.student_id).first():
        raise HTTPException(status_code=400, detail="Student ID already exists")
    student = models.Student(**data.model_dump())
    db.add(student); db.commit(); db.refresh(student)
    log_action(db, current_user.id, "CREATE", "Student", student.id, f"Added {student.first_name} {student.last_name}", request.client.host)
    return student


@app.put("/api/students/{student_id}", response_model=schemas.StudentOut)
def update_student(student_id: int, data: schemas.StudentUpdate, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(student, field, value)
    db.commit(); db.refresh(student)
    log_action(db, current_user.id, "UPDATE", "Student", student.id, f"Updated {student.first_name} {student.last_name}", request.client.host)
    return student


@app.delete("/api/students/{student_id}")
def delete_student(student_id: int, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    name = f"{student.first_name} {student.last_name}"
    db.delete(student); db.commit()
    log_action(db, current_user.id, "DELETE", "Student", student_id, f"Deleted {name}", request.client.host)
    return {"message": "Student deleted"}


# ─── Grades ──────────────────────────────────────────────────────────────────

@app.get("/api/students/{student_id}/grades", response_model=List[schemas.GradeOut])
def get_student_grades(student_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Grade).filter(models.Grade.student_id == student_id).all()


@app.post("/api/grades", response_model=schemas.GradeOut)
def add_grade(data: schemas.GradeCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    marks = data.marks
    if marks >= 90: letter = "A+"
    elif marks >= 85: letter = "A"
    elif marks >= 80: letter = "A-"
    elif marks >= 75: letter = "B+"
    elif marks >= 70: letter = "B"
    elif marks >= 65: letter = "B-"
    elif marks >= 60: letter = "C+"
    elif marks >= 55: letter = "C"
    elif marks >= 50: letter = "D"
    else: letter = "F"
    grade = models.Grade(**data.model_dump(), grade_letter=letter)
    db.add(grade); db.commit(); db.refresh(grade)
    all_grades = db.query(models.Grade).filter(models.Grade.student_id == data.student_id).all()
    avg = sum(g.marks for g in all_grades) / len(all_grades)
    student = db.query(models.Student).filter(models.Student.id == data.student_id).first()
    if student:
        student.gpa = min(round(avg / 25, 2), 4.0)
        db.commit()
    return grade


# ─── Audit Logs ──────────────────────────────────────────────────────────────

@app.get("/api/audit-logs", response_model=List[schemas.AuditLogOut])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(limit).all()


# ─── Serve React Frontend (must be LAST) ─────────────────────────────────────
if SERVE_FRONTEND:
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index):
            return FileResponse(index)
        return {"message": "Frontend not built. Run: cd frontend && npm run build"}