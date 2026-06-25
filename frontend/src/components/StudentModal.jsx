import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const GENDERS = ['male', 'female', 'other']
const STATUSES = ['active', 'inactive', 'graduated', 'suspended']
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

export default function StudentModal({ student, departments, onSave, onClose }) {
  const [form, setForm] = useState({
    student_id: '', first_name: '', last_name: '', email: '',
    phone: '', date_of_birth: '', gender: '', address: '',
    department_id: '', enrollment_year: '', status: 'active',
    emergency_contact: '', emergency_phone: '', notes: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (student) {
      setForm({
        student_id: student.student_id || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        phone: student.phone || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        address: student.address || '',
        department_id: student.department_id || '',
        enrollment_year: student.enrollment_year || '',
        status: student.status || 'active',
        emergency_contact: student.emergency_contact || '',
        emergency_phone: student.emergency_phone || '',
        notes: student.notes || ''
      })
    }
  }, [student])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.department_id) delete payload.department_id
    if (!payload.enrollment_year) delete payload.enrollment_year
    else payload.enrollment_year = parseInt(payload.enrollment_year)
    if (!payload.gender) delete payload.gender
    Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k] })
    payload.status = form.status
    await onSave(payload)
    setSaving(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Basic Information
          </div>
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Student ID *</label>
              <input value={form.student_id} onChange={e => set('student_id', e.target.value)} placeholder="e.g. STU2024001" required disabled={!!student} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Academic Info */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Academic Information
          </div>
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select value={form.department_id} onChange={e => set('department_id', e.target.value)}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Enrollment Year</label>
              <select value={form.enrollment_year} onChange={e => set('enrollment_year', e.target.value)}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Address</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" rows={2} style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Emergency Contact
          </div>
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} placeholder="Parent / Guardian name" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input value={form.emergency_phone} onChange={e => set('emergency_phone', e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div className="form-group full">
              <label className="form-label">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." rows={2} style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="spinner" /> : (student ? 'Update Student' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
