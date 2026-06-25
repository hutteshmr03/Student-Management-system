import { useState, useEffect } from 'react'
import { ClipboardList, RefreshCw, Shield, Plus, Pencil, Trash2 } from 'lucide-react'
import { getAuditLogs } from '../api/client'
import toast from 'react-hot-toast'

const ACTION_COLORS = {
  CREATE: { badge: 'badge-green', icon: <Plus size={11} /> },
  UPDATE: { badge: 'badge-blue', icon: <Pencil size={11} /> },
  DELETE: { badge: 'badge-red', icon: <Trash2 size={11} /> },
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getAuditLogs()
      setLogs(r.data)
    } catch {
      toast.error('Failed to load audit logs')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const formatDate = (d) => {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track all system activities and changes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Actions', value: logs.length, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Creates', value: logs.filter(l => l.action === 'CREATE').length, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Deletes', value: logs.filter(l => l.action === 'DELETE').length, color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.1)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="card empty-state">
          <ClipboardList size={48} />
          <h3>No audit logs yet</h3>
          <p>Actions will appear here as users interact with the system.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const actionStyle = ACTION_COLORS[log.action] || { badge: 'badge-amber', icon: null }
                return (
                  <tr key={log.id}>
                    <td>
                      {log.user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div className="avatar avatar-sm" style={{ background: log.user.role === 'admin' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }}>
                            {initials(log.user.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{log.user.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {log.user.role === 'admin' && <Shield size={9} />} {log.user.role}
                            </div>
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>System</span>}
                    </td>
                    <td>
                      <span className={`badge ${actionStyle.badge}`}>
                        {actionStyle.icon} {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.entity}</span>
                        {log.entity_id && <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>#{log.entity_id}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 220 }}>
                      <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {log.details || '—'}
                      </span>
                    </td>
                    <td>
                      {log.ip_address
                        ? <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>{log.ip_address}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
