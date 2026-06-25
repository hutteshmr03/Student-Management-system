import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Users, Building2, BookOpen, TrendingUp, Activity, ArrowRight, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { getDashboardStats, getStudents, getDepartments } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e']

const enrollmentData = [
  { month:'Jan',students:40 },{ month:'Feb',students:55 },{ month:'Mar',students:48 },
  { month:'Apr',students:70 },{ month:'May',students:65 },{ month:'Jun',students:90 },
  { month:'Jul',students:80 },{ month:'Aug',students:110 },{ month:'Sep',students:130 },
  { month:'Oct',students:115 },{ month:'Nov',students:95 },{ month:'Dec',students:120 },
]
const gpaData = [
  { range:'0-1',count:5 },{ range:'1-2',count:12 },{ range:'2-3',count:30 },
  { range:'3-3.5',count:25 },{ range:'3.5-4',count:28 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentStudents, setRecentStudents] = useState([])
  const [deptData, setDeptData] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([getDashboardStats(), getStudents(), getDepartments()])
      .then(([sR, stR, dR]) => {
        setStats(sR.data)
        setRecentStudents(stR.data.slice(0,5))
        const students = stR.data
        setDeptData(dR.data.map(d => ({
          name: d.code, fullName: d.name,
          students: students.filter(s => s.department_id === d.id).length
        })).filter(d => d.students > 0))
      }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" style={{width:36,height:36}} /></div>

  const statCards = [
    { label:'Total Students', value:stats?.total_students??0, icon:GraduationCap, color:'#3b82f6', bg:'rgba(59,130,246,0.12)', trend:`${stats?.recent_enrollments} this month` },
    { label:'Active Students', value:stats?.active_students??0, icon:Activity, color:'#10b981', bg:'rgba(16,185,129,0.12)', trend:'Enrolled' },
    { label:'Departments', value:stats?.total_departments??0, icon:Building2, color:'#8b5cf6', bg:'rgba(139,92,246,0.12)', trend:'Divisions' },
    { label:'Courses', value:stats?.total_courses??0, icon:BookOpen, color:'#06b6d4', bg:'rgba(6,182,212,0.12)', trend:'Available' },
    { label:'Avg GPA', value:stats?.avg_gpa??'0.00', icon:TrendingUp, color:'#f59e0b', bg:'rgba(245,158,11,0.12)', trend:'All students' },
    { label:'Users', value:stats?.total_users??0, icon:Users, color:'#f43f5e', bg:'rgba(244,63,94,0.12)', trend:'System users' },
  ]

  const statusBadge = s => {
    const map = {active:'badge-green',inactive:'badge-red',graduated:'badge-blue',suspended:'badge-amber'}
    return <span className={`badge ${map[s]||'badge-blue'}`}>{s}</span>
  }

  const TooltipStyle = { contentStyle:{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:12 } }

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.35rem',padding:'0.25rem 0.7rem',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:100,fontSize:'0.72rem',color:'var(--accent-blue)',marginBottom:'0.5rem'}}>
          <Zap size={11} /> Live Dashboard
        </div>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:700}}>
          Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{color:'var(--text-muted)',marginTop:'0.2rem',fontSize:'0.85rem'}}>Here's your institution overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid-stats" style={{marginBottom:'1.25rem'}}>
        {statCards.map(({label,value,icon:Icon,color,bg,trend}) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{background:bg}}><Icon size={20} color={color} /></div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-trend">{trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-charts" style={{marginBottom:'1.25rem'}}>
        <div className="card card-glow">
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontFamily:'var(--font-display)',fontWeight:600}}>Enrollment Trend</div>
            <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:2}}>Monthly student enrollments</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={enrollmentData} margin={{top:5,right:5,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} />
              <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-glow">
          <div style={{fontFamily:'var(--font-display)',fontWeight:600,marginBottom:'0.25rem'}}>By Department</div>
          <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'0.875rem'}}>Student distribution</div>
          {deptData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="students" paddingAngle={3}>
                    {deptData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} formatter={(v,n,p)=>[v,p.payload.fullName]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:'flex',flexDirection:'column',gap:'0.3rem',marginTop:'0.5rem'}}>
                {deptData.slice(0,4).map((d,i)=>(
                  <div key={d.name} style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.75rem'}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}} />
                    <span style={{color:'var(--text-secondary)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.fullName}</span>
                    <span style={{color:'var(--text-muted)',fontWeight:600}}>{d.students}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{padding:'1.5rem'}}><p>No dept data yet</p></div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-bottom">
        <div className="card card-glow">
          <div style={{fontFamily:'var(--font-display)',fontWeight:600,marginBottom:'0.25rem'}}>GPA Distribution</div>
          <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'1rem'}}>Sample data</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={gpaData} margin={{top:0,right:0,left:-25,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:10}} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-glow">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:600}}>Recent Students</div>
              <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:2}}>Latest additions</div>
            </div>
            <Link to="/students" className="btn btn-secondary btn-sm" style={{textDecoration:'none'}}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="empty-state" style={{padding:'1.5rem'}}>
              <GraduationCap size={36} /><p>No students yet</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {recentStudents.map(s => {
                const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase()
                return (
                  <Link key={s.id} to={`/students/${s.id}`} style={{display:'flex',alignItems:'center',gap:'0.65rem',textDecoration:'none',padding:'0.5rem',borderRadius:'var(--radius-md)',transition:'var(--transition)'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div className="avatar avatar-sm">{initials}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'0.85rem',fontWeight:500,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {s.first_name} {s.last_name}
                      </div>
                      <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{s.student_id}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.2rem'}}>
                      {statusBadge(s.status)}
                      <span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>GPA {s.gpa}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
