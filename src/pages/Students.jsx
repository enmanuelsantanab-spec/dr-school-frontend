import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Filter, ChevronLeft, ChevronRight, X, User } from 'lucide-react'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const [guardians, setGuardians] = useState([])
  const pageSize = 20

  useEffect(() => { loadStudents() }, [page, search])

  async function loadStudents() {
    setLoading(true)
    let query = supabase
      .from('students')
      .select('id, first_name, last_name, student_code, gender, date_of_birth, enrollment_status, nationality, created_at', { count: 'exact' })
      .order('last_name')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_code.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (!error) { setStudents(data || []); setTotal(count || 0) }
    setLoading(false)
  }

  async function openDetail(student) {
    setSelected(student)
    const { data } = await supabase
      .from('student_guardians')
      .select('relationship, is_primary_contact, guardians(first_name, last_name, phone_primary, email)')
      .eq('student_id', student.id)
    setGuardians(data || [])
  }

  const totalPages = Math.ceil(total / pageSize)

  const statusBadge = (s) => {
    const map = { active: 'badge-success', inactive: 'badge-warning', graduated: 'badge-info', transferred: 'badge-danger' }
    const labels = { active: 'Activo', inactive: 'Inactivo', graduated: 'Graduado', transferred: 'Transferido' }
    return <span className={`badge ${map[s] || 'badge-info'}`}>{labels[s] || s}</span>
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Estudiantes</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            {total.toLocaleString()} estudiantes registrados
          </p>
        </div>
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Buscar por nombre o código..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ paddingLeft: 36, fontSize: 13, height: 40 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nombre', 'Código', 'Género', 'Nacimiento', 'Estado'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 500,
                    color: 'var(--text-tertiary)', fontSize: 12, textTransform: 'uppercase',
                    letterSpacing: '0.04em', background: 'var(--bg-secondary)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No se encontraron estudiantes</td></tr>
              ) : students.map((s, i) => (
                <tr key={s.id}
                  onClick={() => openDetail(s)}
                  style={{
                    borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, color: 'var(--accent)', flexShrink: 0,
                      }}>
                        {s.first_name?.[0]}{s.last_name?.[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{s.student_code}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.gender === 'M' ? 'Masculino' : s.gender === 'F' ? 'Femenino' : s.gender}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('es-DO') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(s.enrollment_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 13, color: 'var(--text-secondary)',
          }}>
            <span>Página {page + 1} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Slide-over */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
            onClick={() => setSelected(null)} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 420, background: '#fff',
            boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', overflowY: 'auto',
            animation: 'slideFromRight 0.25s ease',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Detalle del Estudiante</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, background: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={24} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{selected.student_code}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Género', value: selected.gender === 'M' ? 'Masculino' : 'Femenino' },
                  { label: 'Nacimiento', value: selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString('es-DO') : '—' },
                  { label: 'Nacionalidad', value: selected.nationality || '—' },
                  { label: 'Estado', value: selected.enrollment_status },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {guardians.length > 0 && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Acudientes</h3>
                  {guardians.map((g, i) => (
                    <div key={i} className="card" style={{ padding: 14, marginBottom: 8, background: 'var(--bg-secondary)' }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {g.guardians?.first_name} {g.guardians?.last_name}
                        {g.is_primary_contact && <span className="badge badge-info" style={{ marginLeft: 8, fontSize: 11 }}>Principal</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        {g.relationship} • {g.guardians?.phone_primary || g.guardians?.email || ''}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slideFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}</style>
        </div>
      )}
    </div>
  )
}
