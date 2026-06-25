# 🎓 EduNexus — Student Database Management System

A full-stack futuristic Student DBMS built with **FastAPI + PostgreSQL** (backend) and **React + Vite** (frontend).

---

## 🗂️ Project Structure

```
student-dbms/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # SQLAlchemy DB models
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # JWT auth utilities
│   ├── database.py      # DB connection
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/       # All page components
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── api/         # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css    # Global dark theme styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml   # PostgreSQL via Docker
```

---

## ✅ Features

### 🔐 Authentication & Roles
- JWT-based login (stored in localStorage)
- Two roles: **Admin** and **User**
- Admin credentials auto-seeded into DB on first run
- Password change from Profile page
- Protected routes by role

### 📊 Dashboard
- Live stats: total students, active, departments, courses, avg GPA
- Enrollment trend chart (AreaChart)
- Department distribution (PieChart)
- GPA distribution (BarChart)
- Recent students list

### 🎓 Students
- Full CRUD (Create, Read, Update, Delete)
- Search by name / email / student ID
- Filter by department and status
- Sort by any column
- Export to CSV
- Student detail page with grades tab
- Status: Active / Inactive / Graduated / Suspended
- GPA auto-calculated from grades
- Emergency contact info

### 🏛️ Departments
- Full CRUD (Admin only for edit/delete)
- Card view with student count per department
- Color-coded department cards

### 📚 Courses
- Full CRUD (Admin only for edit/delete)
- Filter by department and search
- Credits display

### 👥 Users (Admin Only)
- Create / Edit / Delete users
- Toggle active/inactive
- Role management (Admin / User)
- Prevent self-deletion

### 📋 Audit Logs (Admin Only)
- Tracks all CREATE / UPDATE / DELETE actions
- Shows user, entity, IP address, timestamp

### 👤 Profile Page
- View account info and permissions
- Change password

---

## 🚀 Setup & Run

### Step 1 — Start PostgreSQL

```bash
docker-compose up -d
```

> Or use any existing PostgreSQL instance. Update `DATABASE_URL` in `.env`.

---

### Step 2 — Backend Setup

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env if needed (DB URL, admin email/password)

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Default Admin Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | admin@school.edu   |
| Password | Admin@123456       |
| Role     | Admin              |

> Change these in `backend/.env` before production deployment.

---

## 🗄️ Database Models

| Table         | Description                          |
|---------------|--------------------------------------|
| `users`       | System users (admin / staff)         |
| `students`    | Student records                      |
| `departments` | Academic departments                 |
| `courses`     | Courses offered per department       |
| `grades`      | Student grades per course/semester   |
| `audit_logs`  | System activity log                  |

Tables are **auto-created** on first backend startup via SQLAlchemy.

---

## 🌐 API Endpoints Summary

| Method | Endpoint                    | Auth     | Description            |
|--------|-----------------------------|----------|------------------------|
| POST   | /api/auth/login             | Public   | Login                  |
| GET    | /api/auth/me                | User     | Current user           |
| PUT    | /api/auth/change-password   | User     | Change password        |
| GET    | /api/dashboard/stats        | User     | Dashboard statistics   |
| GET    | /api/students               | User     | List/search students   |
| POST   | /api/students               | User     | Create student         |
| PUT    | /api/students/{id}          | User     | Update student         |
| DELETE | /api/students/{id}          | Admin    | Delete student         |
| GET    | /api/departments            | User     | List departments       |
| POST   | /api/departments            | Admin    | Create department      |
| GET    | /api/courses                | User     | List courses           |
| POST   | /api/courses                | Admin    | Create course          |
| POST   | /api/grades                 | User     | Add grade              |
| GET    | /api/users                  | Admin    | List users             |
| POST   | /api/users                  | Admin    | Create user            |
| GET    | /api/audit-logs             | Admin    | View audit logs        |

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python, FastAPI, SQLAlchemy       |
| Database  | PostgreSQL                        |
| Auth      | JWT (python-jose), bcrypt         |
| Frontend  | React 18, Vite, React Router v6   |
| Charts    | Recharts                          |
| Icons     | Lucide React                      |
| Toasts    | React Hot Toast                   |
| Styling   | Custom CSS (dark futuristic theme)|

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build
# Outputs to frontend/dist/

# Backend — serve with gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 🔒 Security Notes

- Change `SECRET_KEY` in `.env` to a long random string in production
- Change default admin password immediately after first login
- Use HTTPS in production
- Set `allow_origins` in CORS to your actual frontend domain (not `"*"`)
