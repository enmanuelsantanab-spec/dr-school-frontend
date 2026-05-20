import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen, Search } from 'lucide-react'

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadSubjects() }, [])

  async function loadSubjects() {
    setLoading(true)
    const { data } = await supabase
      .from('subjects')
      .select('id, name_es, name_en, code, credit_hours, is_active, grade_level_id, grade_levels(name)')
      .order('name_es')
    setSubjects(data || [])
    setLoading(false)
  }

  const filtered = subjects.filter(s =>
    s.name_es?.toLowerCase().includes(search.toLowerCase()) ||
    s.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  )

  const active = subjects.filter(s => s.is_active).length
  const inactive = subjects.filter(s => !s.is_active).length

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Materias</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Plan de estudios del colegio
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Total Materias</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{subjects.length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Activas</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>{active}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Inactivas</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-tertiary)', marginTop: 4 }}>{inactive}</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="input" placeholder="Buscar materia..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36, fontSize: 13 }} />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Código</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Materia (ES)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Subject (EN)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Nivel</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Créditos</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                      {s.code}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={14} color="var(--accent)" />
                      {s.name_es}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.name_en}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.grade_levels?.name || 'General'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{s.credit_hours || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {s.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No se encontraron materias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
