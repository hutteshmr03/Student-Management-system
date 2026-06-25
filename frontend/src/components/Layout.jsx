import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, BookOpen, Building2, GraduationCap,
  LogOut, Shield, ClipboardList, User, Menu, X, Crown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/departments', icon: Building2, label: 'Departments' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
]
const adminItems = [
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GraduationCap size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1 }}>EduNexus</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Student Management</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'none', color: 'var(--text-muted)', padding: '0.25rem', display: 'flex' }} className="lg-hide">
          <X size={18} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0.875rem 0.625rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Menu</div>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.65rem', borderRadius: 'var(--radius-md)', marginBottom: '0.1rem',
            color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
            background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
            textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            borderLeft: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
            transition: 'var(--transition)', minHeight: 44
          })}>
            <Icon size={17} />{label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', padding: '0 0.5rem', margin: '0.875rem 0 0.4rem', textTransform: 'uppercase' }}>Admin</div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.6rem 0.65rem', borderRadius: 'var(--radius-md)', marginBottom: '0.1rem',
                color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                borderLeft: isActive ? '2px solid var(--accent-purple)' : '2px solid transparent',
                transition: 'var(--transition)', minHeight: 44
              })}>
                <Icon size={17} />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div style={{ padding: '0.875rem 0.625rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <div className="avatar avatar-md" style={{
            background: user?.role === 'super_admin'
              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
              : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.role === 'super_admin' && <Crown size={9} color="var(--accent-amber)" />}
              {user?.role === 'admin' && <Shield size={9} color="var(--accent-purple)" />}
              {user?.role}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <NavLink to="/profile" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.78rem', minHeight: 40 }}>
            <User size={13} />Profile
          </NavLink>
          <button onClick={handleLogout} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-rose)', fontSize: '0.78rem', minHeight: 40 }}>
            <LogOut size={13} />Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 'var(--sidebar-width)', flexShrink: 0, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, backdropFilter: 'blur(2px)' }} />}

      <aside style={{ width: 260, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', position: 'fixed', left: open ? 0 : -270, top: 0, bottom: 0, zIndex: 300, transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)' }} className="mobile-sidebar">
        <SidebarContent />
      </aside>

      <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="main-shift">
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0.35rem', display: 'flex', borderRadius: 'var(--radius-sm)', minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={21} />
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }} className="mobile-logo">
            Edu<span className="gradient-text">Nexus</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.65rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--accent-emerald)', borderRadius: '50%', display: 'inline-block' }} /> Online
          </div>
        </header>
        <div style={{ flex: 1, padding: '1.25rem 1rem' }} className="main-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .desktop-sidebar { display: none !important; }
        .mobile-logo { display: block; }
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; flex-direction: column; }
          .mobile-sidebar { display: none !important; }
          .main-shift { margin-left: var(--sidebar-width); }
          .mobile-logo { display: none; }
          .main-content { padding: 1.5rem !important; }
          .lg-hide { display: none !important; }
        }
      `}</style>
    </div>
  )
}