import axios from 'axios'

// In dev: Vite proxies /api → localhost:8000
// In production: FastAPI serves React build, so /api hits the same server
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const changePassword = (data) => api.put('/auth/change-password', data)

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')

// Users
export const getUsers = () => api.get('/users')
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// Departments
export const getDepartments = () => api.get('/departments')
export const createDepartment = (data) => api.post('/departments', data)
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data)
export const deleteDepartment = (id) => api.delete(`/departments/${id}`)

// Courses
export const getCourses = () => api.get('/courses')
export const createCourse = (data) => api.post('/courses', data)
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data)
export const deleteCourse = (id) => api.delete(`/courses/${id}`)

// Students
export const getStudents = (params) => api.get('/students', { params })
export const getStudent = (id) => api.get(`/students/${id}`)
export const createStudent = (data) => api.post('/students', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}`)

// Grades
export const getStudentGrades = (studentId) => api.get(`/students/${studentId}/grades`)
export const addGrade = (data) => api.post('/grades', data)

// Audit logs
export const getAuditLogs = () => api.get('/audit-logs')
