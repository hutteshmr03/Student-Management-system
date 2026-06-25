import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@school.edu')
  const [password, setPassword] = useState('Admin@123456')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%', right: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.08)',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(59,130,246,0.4)'
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            EduNexus
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Student Management System</p>
        </div>

        {/* Admin hint */}
        <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.9rem 1rem',
    background: 'rgba(59,130,246,0.08)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.5rem'
  }}
>
  <Shield size={18} color="#60A5FA" />
  <span
    style={{
      color: '#cbd5e1',
      fontSize: '0.9rem',
      fontStyle: 'italic',
      lineHeight: '1.5'
    }}
  >
    Empowering institutions with secure and intelligent student management.
  </span>
</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@school.edu"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}
          >
            {loading ? <div className="spinner" /> : 'Sign In to EduNexus'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Protected by JWT authentication • All data stored in PostgreSQL
        </p>
      </div>
    </div>
  )
}
