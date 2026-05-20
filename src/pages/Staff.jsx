import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, UserCog } from 'lucide-react'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadStaff() }, [search])

  async function loadStaff() {
    setLoading(true)
    let query = supabase
      .from('staff')
      .select('id, first_name, last_name, email, phone, hire_date, is_active, staff_roles(name_es)')
      .order('last_name')

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }
    const { data } = await query
    setStaff(data || [])
    setLoading(false)
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Personal</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{staff.length} miembros del personal</p>
        </div>
        <div style={{ position: 'relative', width: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Buscar personal..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: 13, height: 40 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Cargando...</div>
        ) : staff.map(s => (
          <div key={s.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 20,
            transition: 'box-shadow 0.15s', cursor: 'default',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: s.is_active ? '#ecfdf5' : '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <UserCog size={20} color={s.is_active ? '#059669' : '#dc2626'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, marginTop: 2 }}>
                {s.staff_roles?.name_es || 'Sin rol'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.email || s.phone || 'Sin contacto'}
              </div>
            </div>
            <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
              {s.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
