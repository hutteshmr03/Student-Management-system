import { useState } from 'react'
import { User, Mail, Shield, Lock, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { changePassword } from '../api/client'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password })
      toast.success('Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card card-glow" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="avatar" style={{
            width: 80, height: 80, fontSize: '1.75rem',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700,
            boxShadow: 'var(--glow-blue)', flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>{user?.name}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <Mail size={14} /> {user?.email}
              </div>
              <span className={`badge ${isAdmin ? 'badge-purple' : 'badge-blue'}`}>
                {isAdmin ? <><Shield size={10} /> Admin</> : <><User size={10} /> User</>}
              </span>
              <span className="badge badge-green">
                <Check size={10} /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            ['Account Type', isAdmin ? 'Administrator' : 'Standard User'],
            ['Member Since', new Date(user?.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
            ['Account Status', 'Active'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{k}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '1rem' }}>Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'View Students', allowed: true },
            { label: 'Add / Edit Students', allowed: true },
            { label: 'Delete Students', allowed: isAdmin },
            { label: 'Manage Departments', allowed: isAdmin },
            { label: 'Manage Courses', allowed: isAdmin },
            { label: 'Manage Users', allowed: isAdmin },
            { label: 'View Audit Logs', allowed: isAdmin },
            { label: 'Add Grades', allowed: true },
          ].map(({ label, allowed }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.75rem',
              background: allowed ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
              border: `1px solid ${allowed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem'
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: allowed ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {allowed ? <Check size={10} color="white" /> : <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✕</span>}
              </div>
              <span style={{ color: allowed ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.25rem' }}>Change Password</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Use a strong password with at least 8 characters.</p>
        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwForm.current_password}
                  onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
                  placeholder="Enter current password"
                  required
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.new_password}
                  onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', marginTop: '0.25rem' }}>Passwords do not match</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="spinner" /> : <><Lock size={15} /> Change Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
