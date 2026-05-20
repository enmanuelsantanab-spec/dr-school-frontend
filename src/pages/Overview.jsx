import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Users, GraduationCap, CreditCard, UserCog, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Overview() {
  const { role } = useAuth()
  const [stats, setStats] = useState({ students: 0, sections: 0, staff: 0, guardians: 0 })
  const [gradeData, setGradeData] = useState([])
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [studentsRes, sectionsRes, staffRes, guardiansRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('sections').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('guardians').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        students: studentsRes.count || 0,
        sections: sectionsRes.count || 0,
        staff: staffRes.count || 0,
        guardians: guardiansRes.count || 0,
      })

      // Grade distribution
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('section_id, sections(name, grade_level_id, grade_levels(name_es))')
      if (enrollments) {
        const counts = {}
        enrollments.forEach(e => {
          const gl = e.sections?.grade_levels?.name_es || 'N/A'
          counts[gl] = (counts[gl] || 0) + 1
        })
        setGradeData(Object.entries(counts).map(([name, count]) => ({ name: name.length > 10 ? name.slice(0, 10) : name, count })).slice(0, 12))
      }

      // Recent students
      const { data: recent } = await supabase
        .from('students')
        .select('id, first_name, last_name, student_code, enrollment_status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentStudents(recent || [])
    } catch (err) {
      console.error('Error loading overview:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Estudiantes', value: stats.students, icon: Users, color: '#4f46e5', bg: '#eef2ff', trend: '+12%' },
    { label: 'Secciones', value: stats.sections, icon: GraduationCap, color: '#059669', bg: '#ecfdf5', trend: null },
    { label: 'Personal', value: stats.staff, icon: UserCog, color: '#d97706', bg: '#fffbeb', trend: null },
    { label: 'Acudientes', value: stats.guardians, icon: CreditCard, color: '#0891b2', bg: '#ecfeff', trend: '+8%' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Panel General</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Resumen del sistema escolar
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {s.value.toLocaleString()}
                </span>
                {s.trend && (
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp size={12} /> {s.trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }} className="overview-grid">
        {/* Chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Estudiantes por Nivel</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  cursor={{ fill: 'rgba(79,70,229,0.06)' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Estudiantes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent students */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Últimos Registros</h3>
          </div>
          <div>
            {recentStudents.map((s, i) => (
              <div key={s.id} style={{
                padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                borderTop: i === 0 ? '1px solid var(--border-light)' : 'none',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, background: 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0,
                }}>
                  {s.first_name?.[0]}{s.last_name?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.first_name} {s.last_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.student_code}</div>
                </div>
                <span className={`badge ${s.enrollment_status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {s.enrollment_status === 'active' ? 'Activo' : s.enrollment_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
