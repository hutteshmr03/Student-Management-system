import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Building2, X } from 'lucide-react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getStudents } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const DEPT_COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e']

export default function DepartmentsPage() {
  const { isAdmin } = useAuth()
  const [depts, setDepts] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editDept, setEditDept] = useState(null)
  const [form, setForm] = useState({ name:'', code:'', description:'' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    const [dr, sr] = await Promise.all([getDepartments(), getStudents()])
    setDepts(dr.data); setStudents(sr.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openModal = (dept=null) => {
    setEditDept(dept)
    setForm(dept ? { name:dept.name, code:dept.code, description:dept.description||'' } : { name:'', code:'', description:'' })
    setModal(true)
  }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editDept) { await updateDepartment(editDept.id, form); toast.success('Updated!') }
      else { await createDepartment(form); toast.success('Created!') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await deleteDepartment(deleteId); toast.success('Deleted'); setDeleteId(null); load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed') }
  }

  const studentCount = id => students.filter(s => s.department_id === id).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{depts.length} departments</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            <Plus size={15} /> Add
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : depts.length === 0 ? (
        <div className="card empty-state"><Building2 size={44} /><h3>No departments yet</h3></div>
      ) : (
        <div className="grid-dept">
          {depts.map((d, i) => {
            const color = DEPT_COLORS[i % DEPT_COLORS.length]
            const count = studentCount(d.id)
            return (
              <div key={d.id} className="card" style={{position:'relative',overflow:'hidden',transition:'var(--transition)',borderTop:`3px solid ${color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.875rem'}}>
                  <div style={{width:44,height:44,borderRadius:'var(--radius-md)',background:`${color}20`,border:`1px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Building2 size={20} color={color} />
                  </div>
                  {isAdmin && (
                    <div style={{display:'flex',gap:'0.3rem'}}>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openModal(d)}><Pencil size={13}/></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(d.id)}><Trash2 size={13}/></button>
                    </div>
                  )}
                </div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1rem',marginBottom:'0.2rem'}}>{d.name}</div>
                <div style={{display:'inline-flex',padding:'0.12rem 0.5rem',background:`${color}15`,borderRadius:100,fontSize:'0.7rem',fontWeight:700,color,marginBottom:'0.6rem',letterSpacing:'0.05em'}}>{d.code}</div>
                {d.description && <p style={{fontSize:'0.8rem',color:'var(--text-muted)',lineHeight:1.5,marginBottom:'0.875rem'}}>{d.description}</p>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'0.75rem',borderTop:'1px solid var(--border)'}}>
                  <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Students</span>
                  <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1.3rem',color}}>{count}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:440}}>
            <div className="modal-handle" />
            <div className="modal-header">
              <h2 className="modal-title">{editDept ? 'Edit Department' : 'Add Department'}</h2>
              <button className="btn btn-secondary btn-icon" onClick={()=>setModal(false)}><X size={17}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                <div className="form-group"><label className="form-label">Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Computer Science" required /></div>
                <div className="form-group"><label className="form-label">Code *</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="CS" required maxLength={10} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{resize:'vertical'}} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner"/> : (editDept?'Update':'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:360}}>
            <div className="modal-handle" />
            <div style={{textAlign:'center',padding:'0.5rem 0 1rem'}}>
              <div style={{width:50,height:50,borderRadius:'50%',background:'rgba(244,63,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.875rem'}}><Trash2 size={22} color="var(--accent-rose)"/></div>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:600,marginBottom:'0.4rem'}}>Delete Department?</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Students will become unassigned.</p>
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
