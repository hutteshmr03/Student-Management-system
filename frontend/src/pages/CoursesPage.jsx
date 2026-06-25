import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, BookOpen, X, Search } from 'lucide-react'
import { getCourses, createCourse, updateCourse, deleteCourse, getDepartments } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CoursesPage() {
  const { isAdmin } = useAuth()
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [modal, setModal] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', credits: 3, department_id: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    const [cr, dr] = await Promise.all([getCourses(), getDepartments()])
    setCourses(cr.data)
    setDepartments(dr.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openModal = (course = null) => {
    setEditCourse(course)
    setForm(course
      ? { name: course.name, code: course.code, credits: course.credits, department_id: course.department_id }
      : { name: '', code: '', credits: 3, department_id: '' }
    )
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.department_id) { toast.error('Please select a department'); return }
    setSaving(true)
    try {
      const payload = { ...form, credits: parseInt(form.credits), department_id: parseInt(form.department_id) }
      if (editCourse) { await updateCourse(editCourse.id, payload); toast.success('Course updated!') }
      else { await createCourse(payload); toast.success('Course created!') }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving course')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteCourse(deleteId)
      toast.success('Course deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
    const matchDept = !filterDept || c.department_id === parseInt(filterDept)
    return matchSearch && matchDept
  })

  const creditBadge = (n) => {
    const color = n >= 4 ? 'var(--accent-purple)' : n >= 3 ? 'var(--accent-blue)' : 'var(--accent-cyan)'
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, color }}>
        {n} cr
      </span>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">{courses.length} courses available</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={16} /> Add Course
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
          <div className="search-wrapper">
            <Search size={15} className="search-icon" />
            <input placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <BookOpen size={48} />
          <h3>No courses found</h3>
          <p>Try adjusting filters or add a new course.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Department</th>
                <th>Credits</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: `${['rgba(59,130,246,0.15)', 'rgba(139,92,246,0.15)', 'rgba(6,182,212,0.15)', 'rgba(16,185,129,0.15)'][i % 4]}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <BookOpen size={16} color={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][i % 4]} />
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{c.code}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--accent-blue)' }}>{c.department?.name || '—'}</td>
                  <td>{creditBadge(c.credits)}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openModal(c)}><Pencil size={13} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(c.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editCourse ? 'Edit Course' : 'Add Course'}</h2>
              <button className="btn btn-secondary btn-icon" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Course Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Data Structures & Algorithms" required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Course Code *</label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. CS301" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credits *</label>
                    <input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} min={1} max={6} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))} required>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : (editCourse ? 'Update' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trash2 size={24} color="var(--accent-rose)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.5rem' }}>Delete Course?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Associated grade records will also be removed.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
