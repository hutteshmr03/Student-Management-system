import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, GraduationCap, Mail, Phone, MapPin, Calendar,
  Building2, Award, Plus, Pencil, Trash2, BookOpen, User
} from 'lucide-react'
import { getStudent, getStudentGrades, addGrade, updateStudent, getCourses, deleteStudent } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import StudentModal from '../components/StudentModal'
import { getDepartments } from '../api/client'

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [student, setStudent] = useState(null)
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [gradeModal, setGradeModal] = useState(false)
  const [gradeForm, setGradeForm] = useState({ course_id: '', semester: '', year: new Date().getFullYear(), marks: '' })
  const [activeTab, setActiveTab] = useState('overview')

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, gRes, cRes, dRes] = await Promise.all([
        getStudent(id), getStudentGrades(id), getCourses(), getDepartments()
      ])
      setStudent(sRes.data)
      setGrades(gRes.data)
      setCourses(cRes.data)
      setDepartments(dRes.data)
    } catch { navigate('/students') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async (data) => {
    try {
      await updateStudent(id, data)
      toast.success('Student updated!')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    }
  }

  const handleAddGrade = async (e) => {
    e.preventDefault()
    try {
      await addGrade({ ...gradeForm, student_id: parseInt(id), course_id: parseInt(gradeForm.course_id), year: parseInt(gradeForm.year), marks: parseFloat(gradeForm.marks) })
      toast.success('Grade added!')
      setGradeModal(false)
      setGradeForm({ course_id: '', semester: '', year: new Date().getFullYear(), marks: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add grade')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this student permanently?')) return
    try {
      await deleteStudent(id)
      toast.success('Student deleted')
      navigate('/students')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
  if (!student) return null

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()

  const statusBadge = (s) => {
    const map = { active: 'badge-green', inactive: 'badge-red', graduated: 'badge-blue', suspended: 'badge-amber' }
    return <span className={`badge ${map[s] || 'badge-blue'}`}>{s}</span>
  }

  const gradeColor = (l) => {
    if (!l) return 'var(--text-muted)'
    if (l.startsWith('A')) return 'var(--accent-emerald)'
    if (l.startsWith('B')) return 'var(--accent-blue)'
    if (l.startsWith('C')) return 'var(--accent-amber)'
    return 'var(--accent-rose)'
  }

  return (
    <div>
      {/* Back */}
      <Link to="/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} /> Back to Students
      </Link>

      {/* Profile Header */}
      <div className="card card-glow" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg" style={{ width: 72, height: 72, fontSize: '1.5rem', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
                {student.first_name} {student.last_name}
              </h1>
              {statusBadge(student.status)}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{student.student_id}</span>
              {student.department && <span style={{ color: 'var(--accent-blue)' }}>{student.department.name}</span>}
              {student.enrollment_year && <span>Class of {student.enrollment_year}</span>}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} />{student.email}</div>
              {student.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} />{student.phone}</div>}
              {student.address && <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={13} />{student.address}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: student.gpa >= 3.5 ? 'var(--accent-emerald)' : student.gpa >= 2.5 ? 'var(--accent-blue)' : 'var(--accent-amber)' }}>
                {student.gpa}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GPA / 4.0</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Edit
              </button>
              {isAdmin && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.25rem', width: 'fit-content' }}>
        {['overview', 'grades'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Personal Info */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
              <User size={16} color="var(--accent-blue)" /> Personal Information
            </div>
            {[
              ['Full Name', `${student.first_name} ${student.last_name}`],
              ['Email', student.email],
              ['Phone', student.phone || '—'],
              ['Date of Birth', student.date_of_birth || '—'],
              ['Gender', student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—'],
              ['Address', student.address || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Academic Info */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
              <GraduationCap size={16} color="var(--accent-purple)" /> Academic Information
            </div>
            {[
              ['Student ID', student.student_id],
              ['Department', student.department?.name || '—'],
              ['Enrollment Year', student.enrollment_year || '—'],
              ['Status', student.status],
              ['GPA', `${student.gpa} / 4.0`],
              ['Total Grades', grades.length],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Emergency Contact */}
          {(student.emergency_contact || student.emergency_phone) && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Emergency Contact</div>
              {[
                ['Contact Name', student.emergency_contact || '—'],
                ['Contact Phone', student.emergency_phone || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {student.notes && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Notes</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{student.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Academic Grades</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setGradeModal(true)}>
              <Plus size={15} /> Add Grade
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {grades.length === 0 ? (
              <div className="empty-state">
                <Award size={40} />
                <h3>No grades recorded</h3>
                <p>Add grades using the button above.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Year</th>
                    <th>Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(g => (
                    <tr key={g.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{g.course?.name || `Course #${g.course_id}`}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.course?.code}</div>
                      </td>
                      <td>{g.semester}</td>
                      <td>{g.year}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${g.marks}%`, background: g.marks >= 80 ? 'var(--accent-emerald)' : g.marks >= 60 ? 'var(--accent-blue)' : 'var(--accent-rose)' }} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{g.marks}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: gradeColor(g.grade_letter) }}>
                          {g.grade_letter || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <StudentModal student={student} departments={departments} onSave={handleUpdate} onClose={() => setEditOpen(false)} />
      )}

      {/* Grade Modal */}
      {gradeModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Grade</h2>
              <button className="btn btn-secondary btn-icon" onClick={() => setGradeModal(false)}><span>✕</span></button>
            </div>
            <form onSubmit={handleAddGrade}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Course *</label>
                  <select value={gradeForm.course_id} onChange={e => setGradeForm(f => ({ ...f, course_id: e.target.value }))} required>
                    <option value="">Select course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <select value={gradeForm.semester} onChange={e => setGradeForm(f => ({ ...f, semester: e.target.value }))} required>
                    <option value="">Select</option>
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input type="number" value={gradeForm.year} onChange={e => setGradeForm(f => ({ ...f, year: e.target.value }))} min={2000} max={2099} required />
                </div>
                <div className="form-group full">
                  <label className="form-label">Marks (0–100) *</label>
                  <input type="number" value={gradeForm.marks} onChange={e => setGradeForm(f => ({ ...f, marks: e.target.value }))} min={0} max={100} step={0.01} placeholder="e.g. 87.5" required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setGradeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
