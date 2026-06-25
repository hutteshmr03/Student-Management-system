import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import StudentDetailPage from './pages/StudentDetailPage'
import DepartmentsPage from './pages/DepartmentsPage'
import CoursesPage from './pages/CoursesPage'
import UsersPage from './pages/UsersPage'
import AuditLogPage from './pages/AuditLogPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !['admin', 'super_admin'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute adminOnly><AuditLogPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1428',
              color: '#e2e8f0',
              border: '1px solid #1a2540',
              borderRadius: '10px',
              fontSize: '0.875rem'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0d1428' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0d1428' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
