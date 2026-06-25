import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users, X, Shield, User, Crown } from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { user: me } = useAuth()
  const isSuperAdmin = me?.role === 'super_admin'
  const isAdmin = me?.role === 'admin' || isSuperAdmin

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    const r = await getUsers()
    setUsers(r.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openModal = (u = null) => {
    setEditUser(u)
    setForm(u ? { name: u.name, email: u.email, password: '', role: u.role } : { name: '', email: '', password: '', role: 'user' })
    setModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editUser) {
        await updateUser(editUser.id, { name: form.name, email: form.email, role: form.role })
        toast.success('User updated!')
      } else {
        await createUser(form)
        toast.success('User created!')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId)
      toast.success('User deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot delete this user')
    }
  }

  const toggleActive = async u => {
    try {
      await updateUser(u.id, { is_active: !u.is_active })
      toast.success(u.is_active ? 'Deactivated' : 'Activated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  const initials = name => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const canEdit = u => {
    if (u.role === 'super_admin') return u.id === me?.id
    if (u.role === 'admin') return isSuperAdmin
    return isAdmin
  }

  const canDelete = u => {
    if (u.id === me?.id) return false
    if (u.role === 'super_admin') return false
    if (u.role === 'admin') return isSuperAdmin
    return isAdmin
  }

  const roleBadge = role => {
    if (role === 'super_admin') return (
      <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <Crown size={9} /> Super Admin
      </span>
    )
    if (role === 'admin') return (
      <span className="badge badge-purple">
        <Shield size={9} /> Admin
      </span>
    )
    return (
      <span className="badge badge-blue">
        <User size={9} /> User
      </span>
    )
  }

  const roleOptions = () => {
    if (isSuperAdmin) return [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' },
    ]
    return [{ value: 'user', label: 'User' }]
  }

  const summaryCards = [
    { label: 'Total Users', value: users.length, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Active', value: users.filter(u => u.is_active).length, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            {isSuperAdmin ? 'Super Admin — full control' : 'Admin — manage staff users'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {isSuperAdmin && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1rem', marginBottom: '1.25rem',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--accent-amber)'
        }}>
          <Crown size={16} />
          You are the <b style={{ margin: '0 4px' }}>Super Admin</b> — only you can create, edit, and delete admins. Your account cannot be deleted by anyone.
        </div>
      )}

      <div className="grid-3col" style={{ marginBottom: '1.25rem' }}>
        {summaryCards.map(({ label, value, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Your Permissions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.5rem' }}>
          {[
            { label: 'Create Users', allowed: true },
            { label: 'Create Admins', allowed: isSuperAdmin },
            { label: 'Edit Users', allowed: true },
            { label: 'Edit Admins', allowed: isSuperAdmin },
            { label: 'Delete Users', allowed: true },
            { label: 'Delete Admins', allowed: isSuperAdmin },
            { label: 'Delete Super Admin', allowed: false },
            { label: 'Delete Yourself', allowed: false },
          ].map(({ label, allowed }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 0.7rem', fontSize: '0.78rem',
              background: allowed ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
              border: `1px solid ${allowed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
              borderRadius: 'var(--radius-sm)'
            }}>
              <span style={{ fontSize: 13 }}>{allowed ? '✅' : '❌'}</span>
              <span style={{ color: allowed ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card mobile-hide" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div className="avatar avatar-sm" style={{
                            background: u.role === 'super_admin'
                              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                              : u.role === 'admin'
                                ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))'
                                : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
                          }}>
                            {initials(u.name)}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {u.name}
                            {u.id === me?.id && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginLeft: 4 }}>(you)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>
                        <button
                          onClick={() => canEdit(u) && u.role !== 'super_admin' && toggleActive(u)}
                          style={{
                            cursor: canEdit(u) && u.role !== 'super_admin' ? 'pointer' : 'not-allowed',
                            background: 'none', border: 'none'
                          }}
                        >
                          <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {canEdit(u) && (
                            <button
                              className="btn btn-secondary btn-icon btn-sm"
                              onClick={() => openModal(u)}
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          {canDelete(u) && (
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              onClick={() => setDeleteId(u.id)}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          {!canEdit(u) && !canDelete(u) && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.3rem' }}>
                              🔒 Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-card-list">
            {users.map(u => (
              <div key={u.id} style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', padding: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                  <div className="avatar avatar-md" style={{
                    background: u.role === 'super_admin'
                      ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                      : u.role === 'admin'
                        ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))'
                        : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
                  }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                      {u.id === me?.id && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginLeft: 4 }}>(you)</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </div>
                  </div>
                  {roleBadge(u.role)}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {canEdit(u) && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => openModal(u)}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  {canDelete(u) && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ justifyContent: 'center' }}
                      onClick={() => setDeleteId(u.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  {canEdit(u) && u.role !== 'super_admin' && (
                    <button
                      onClick={() => toggleActive(u)}
                      style={{
                        flex: 1, fontSize: '0.78rem', padding: '0.4rem',
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: u.is_active ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                        cursor: 'pointer'
                      }}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                  {!canEdit(u) && !canDelete(u) && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem' }}>
                      🔒 Protected account
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-handle" />
            <div className="modal-header">
              <h2 className="modal-title">{editUser ? 'Edit User' : 'Create User'}</h2>
              <button className="btn btn-secondary btn-icon" onClick={() => setModal(false)}>
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="user@school.edu"
                    required
                  />
                </div>
                {!editUser && (
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    disabled={editUser?.role === 'super_admin'}
                  >
                    {roleOptions().map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {!isSuperAdmin && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Only Super Admin can create or promote admins.
                    </div>
                  )}
                </div>
                {form.role === 'admin' && isSuperAdmin && (
                  <div style={{
                    display: 'flex', gap: '0.5rem', padding: '0.75rem',
                    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--accent-purple)'
                  }}>
                    <Shield size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    This user will be an Admin — they can manage students, departments and courses but cannot manage other admins.
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : (editUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'rgba(244,63,94,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.875rem'
              }}>
                <Trash2 size={22} color="var(--accent-rose)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.4rem' }}>
                Delete User?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                This user will permanently lose all system access.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}