import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Users } from 'lucide-react'

export default function Sections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [search])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('sections')
      .select('id, name, max_capacity, grade_levels(name_es, code), school_years(label)')
      .order('name')

    let results = data || []
    if (search) {
      const s = search.toLowerCase()
      results = results.filter(sec =>
        sec.name?.toLowerCase().includes(s) ||
        sec.grade_levels?.name_es?.toLowerCase().includes(s)
      )
    }

    // Get enrollment counts
    const { data: enrollments } = await supabase.from('enrollments').select('section_id')
    const countMap = {}
    ;(enrollments || []).forEach(e => { countMap[e.section_id] = (countMap[e.section_id] || 0) + 1 })
    results = results.map(s => ({ ...s, enrolled: countMap[s.id] || 0 }))

    setSections(results)
    setLoading(false)
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Secciones</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{sections.length} secciones</p>
        </div>
        <div style={{ position: 'relative', width: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Buscar sección..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: 13, height: 40 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Cargando...</div>
        ) : sections.map(s => {
          const pct = s.max_capacity ? Math.round((s.enrolled / s.max_capacity) * 100) : 0
          const barColor = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--accent)'
          return (
            <div key={s.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.grade_levels?.name_es}</div>
                </div>
                <span className="badge badge-info" style={{ fontSize: 11 }}>{s.school_years?.label || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Users size={14} color="var(--text-tertiary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {s.enrolled} / {s.max_capacity || '—'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
