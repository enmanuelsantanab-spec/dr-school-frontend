import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Bell, Mail, MessageSquare, Search, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, email: 0, whatsapp: 0, read: 0 })
  const pageSize = 20

  useEffect(() => { loadNotifications() }, [page, search, channelFilter])
  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const { data } = await supabase.from('notifications').select('channel, read_at')
    if (data) {
      setStats({
        total: data.length,
        email: data.filter(n => n.channel === 'email').length,
        whatsapp: data.filter(n => n.channel === 'whatsapp').length,
        read: data.filter(n => n.read_at).length,
      })
    }
  }

  async function loadNotifications() {
    setLoading(true)
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (channelFilter !== 'all') query = query.eq('channel', channelFilter)
    if (search) query = query.or(`subject.ilike.%${search}%,message.ilike.%${search}%`)

    const { data, count } = await query
    setNotifications(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  function fmtDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const channelIcon = (ch) => {
    if (ch === 'email') return <Mail size={14} color="#4f46e5" />
    if (ch === 'whatsapp') return <MessageSquare size={14} color="#25D366" />
    return <Bell size={14} color="var(--text-tertiary)" />
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Notificaciones</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Historial de notificaciones enviadas a acudientes y personal
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Total Enviadas</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={12} /> Email
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5', marginTop: 4 }}>{stats.email}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageSquare size={12} /> WhatsApp
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#25D366', marginTop: 4 }}>{stats.whatsapp}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Leídas</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>{stats.read}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Buscar por asunto o mensaje..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ paddingLeft: 36, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'email', label: 'Email' },
            { value: 'whatsapp', label: 'WhatsApp' },
          ].map(f => (
            <button key={f.value}
              className={`btn btn-sm ${channelFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setChannelFilter(f.value); setPage(0) }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay notificaciones</div>
        ) : (
          <div>
            {notifications.map((n, i) => (
              <div key={n.id} style={{
                padding: '14px 20px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none',
                display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: n.channel === 'email' ? 'var(--accent-light)' : n.channel === 'whatsapp' ? '#dcfce7' : 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {channelIcon(n.channel)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{n.subject || 'Sin asunto'}</span>
                    {n.read_at ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--success)' }}>
                        <CheckCircle2 size={12} /> Leída
                      </span>
                    ) : n.sent_at ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)' }}>
                        <Clock size={12} /> Enviada
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Pendiente</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: 42, overflow: 'hidden' }}>
                    {n.message || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, display: 'flex', gap: 12 }}>
                    <span>{fmtDate(n.sent_at || n.created_at)}</span>
                    <span style={{ textTransform: 'capitalize' }}>{n.channel}</span>
                    {n.recipient_type && <span>Para: {n.recipient_type}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={16} /> Anterior
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Página {page + 1} de {totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
