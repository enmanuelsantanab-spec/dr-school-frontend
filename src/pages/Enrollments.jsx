import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  useEffect(() => { load() }, [page, search])

  async function load() {
    setLoading(true)
    let query = supabase
      .from('enrollments')
      .select('id, enrolled_at, students(first_name, last_name, student_code), sections(name, grade_levels(name_es)), school_years(name)', { count: 'exact' })
      .order('enrolled_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    const { data, count } = await query
    let results = data || []
    if (search) {
      const s = search.toLowerCase()
      results = results.filter(e =>
        `${e.students?.first_name} ${e.students?.last_name}`.toLowerCase().includes(s) ||
        e.students?.student_code?.toLowerCase().includes(s)
      )
    }
    setEnrollments(results)
    setTotal(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Inscripciones</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{total.toLocaleString()} inscripciones</p>
        </div>
        <div style={{ position: 'relative', width: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Buscar estudiante..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ paddingLeft: 36, fontSize: 13, height: 40 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Estudiante', 'Código', 'Sección', 'Nivel', 'Año Escolar', 'Fecha'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 500,
                    color: 'var(--text-tertiary)', fontSize: 11, textTransform: 'uppercase',
                    letterSpacing: '0.04em', background: 'var(--bg-secondary)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</td></tr>
              ) : enrollments.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.1s' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{e.students?.first_name} {e.students?.last_name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{e.students?.student_code}</td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-info">{e.sections?.name || '—'}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{e.sections?.grade_levels?.name_es || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{e.school_years?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>
                    {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('es-DO') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)',
          }}>
            <span>Página {page + 1} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
