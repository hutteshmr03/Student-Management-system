import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Pencil, Trash2, GraduationCap, Download, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import { getStudents, createStudent, updateStudent, deleteStudent, getDepartments } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import StudentModal from '../components/StudentModal'

const STATUS_OPTIONS = ['active','inactive','graduated','suspended']

export default function StudentsPage() {
  const { isAdmin } = useAuth()
  const [students, setStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterDept) params.department_id = filterDept
      if (filterStatus) params.status = filterStatus
      const res = await getStudents(params)
      setStudents(res.data)
    } finally { setLoading(false) }
  }, [search, filterDept, filterStatus])

  useEffect(() => { getDepartments().then(r => setDepartments(r.data)) }, [])
  useEffect(() => { const t = setTimeout(fetchStudents, 300); return () => clearTimeout(t) }, [fetchStudents])

  const handleSave = async (data) => {
    try {
      if (editStudent) { await updateStudent(editStudent.id, data); toast.success('Student updated!') }
      else { await createStudent(data); toast.success('Student added!') }
      setModalOpen(false); setEditStudent(null); fetchStudents()
    } catch (err) { toast.error(err.response?.data?.detail || 'Error saving student') }
  }

  const handleDelete = async () => {
    try { await deleteStudent(deleteId); toast.success('Student deleted'); setDeleteId(null); fetchStudents() }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed') }
  }

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...students].sort((a,b) => {
    let av = a[sortField], bv = b[sortField]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const SortIcon = ({ field }) => sortField !== field ? null : sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />

  const statusBadge = s => {
    const map = {active:'badge-green',inactive:'badge-red',graduated:'badge-blue',suspended:'badge-amber'}
    return <span className={`badge ${map[s]||'badge-blue'}`}>{s}</span>
  }

  const exportCSV = () => {
    const headers = ['ID','First Name','Last Name','Email','Department','Status','GPA']
    const rows = sorted.map(s => [s.student_id,s.first_name,s.last_name,s.email,s.department?.name||'',s.status,s.gpa])
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='students.csv'; a.click()
    toast.success('CSV exported!')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} total</p>
        </div>
        <div className="action-bar">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Download size={14} /></button>
          <button className="btn btn-secondary btn-sm" onClick={fetchStudents}><RefreshCw size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditStudent(null); setModalOpen(true) }}>
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:'1rem',padding:'0.875rem'}}>
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input placeholder="Search name, email, ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div className="card empty-state"><GraduationCap size={44} /><h3>No students found</h3><p>Adjust filters or add a student.</p></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card mobile-hide" style={{padding:0,overflow:'hidden'}}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{cursor:'pointer'}} onClick={() => handleSort('student_id')}><div style={{display:'flex',alignItems:'center',gap:3}}>ID <SortIcon field="student_id"/></div></th>
                    <th style={{cursor:'pointer'}} onClick={() => handleSort('first_name')}><div style={{display:'flex',alignItems:'center',gap:3}}>Name <SortIcon field="first_name"/></div></th>
                    <th>Email</th>
                    <th>Dept</th>
                    <th style={{cursor:'pointer'}} onClick={() => handleSort('gpa')}><div style={{display:'flex',alignItems:'center',gap:3}}>GPA <SortIcon field="gpa"/></div></th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(s => {
                    const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase()
                    return (
                      <tr key={s.id}>
                        <td><span style={{fontFamily:'monospace',fontSize:'0.78rem',color:'var(--accent-cyan)'}}>{s.student_id}</span></td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:'0.55rem'}}>
                            <div className="avatar avatar-sm">{initials}</div>
                            <div>
                              <div style={{fontWeight:500,color:'var(--text-primary)',fontSize:'0.85rem'}}>{s.first_name} {s.last_name}</div>
                              <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{s.gender||'—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{fontSize:'0.8rem'}}>{s.email}</td>
                        <td style={{fontSize:'0.8rem',color:'var(--accent-blue)'}}>{s.department?.name||'—'}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                            <div style={{width:36,height:3,borderRadius:4,background:'var(--border)',overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${(s.gpa/4)*100}%`,background:s.gpa>=3.5?'var(--accent-emerald)':s.gpa>=2.5?'var(--accent-blue)':'var(--accent-amber)'}} />
                            </div>
                            <span style={{fontSize:'0.8rem',fontWeight:600}}>{s.gpa}</span>
                          </div>
                        </td>
                        <td>{statusBadge(s.status)}</td>
                        <td>
                          <div style={{display:'flex',gap:'0.3rem'}}>
                            <Link to={`/students/${s.id}`} className="btn btn-secondary btn-icon btn-sm"><Eye size={13}/></Link>
                            <button className="btn btn-secondary btn-icon btn-sm" onClick={()=>{setEditStudent(s);setModalOpen(true)}}><Pencil size={13}/></button>
                            {isAdmin && <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDeleteId(s.id)}><Trash2 size={13}/></button>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="mobile-card-list">
            {sorted.map(s => {
              const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase()
              return (
                <div key={s.id} style={{background:'var(--bg-card)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',padding:'0.875rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.625rem'}}>
                    <div className="avatar avatar-md">{initials}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:'0.9rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.first_name} {s.last_name}</div>
                      <div style={{fontSize:'0.72rem',color:'var(--accent-cyan)',fontFamily:'monospace'}}>{s.student_id}</div>
                    </div>
                    {statusBadge(s.status)}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'0.75rem'}}>
                    <span>{s.department?.name||'No dept'}</span>
                    <span>GPA: <b style={{color:'var(--text-primary)'}}>{s.gpa}</b></span>
                    <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',gridColumn:'1/-1'}}>{s.email}</span>
                  </div>
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <Link to={`/students/${s.id}`} className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center',textDecoration:'none'}}><Eye size={13}/> View</Link>
                    <button className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}} onClick={()=>{setEditStudent(s);setModalOpen(true)}}><Pencil size={13}/> Edit</button>
                    {isAdmin && <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDeleteId(s.id)}><Trash2 size={13}/></button>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {modalOpen && <StudentModal student={editStudent} departments={departments} onSave={handleSave} onClose={()=>{setModalOpen(false);setEditStudent(null)}} />}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:380}}>
            <div className="modal-handle" />
            <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(244,63,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.875rem'}}>
                <Trash2 size={22} color="var(--accent-rose)" />
              </div>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:600,marginBottom:'0.4rem'}}>Delete Student?</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={()=>setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
