import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, ChevronLeft, ChevronRight, DollarSign, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

export default function Payments() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ pending: 0, paid: 0, overdue: 0, totalDue: 0 })
  const pageSize = 15

  useEffect(() => { loadInvoices() }, [page, search, statusFilter])
  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const { data } = await supabase.from('invoices').select('status, total_amount')
    if (data) {
      const s = { pending: 0, paid: 0, overdue: 0, totalDue: 0 }
      data.forEach(inv => {
        if (inv.status === 'paid') s.paid++
        else if (inv.status === 'overdue') { s.overdue++; s.totalDue += Number(inv.total_amount) || 0 }
        else if (inv.status === 'pending' || inv.status === 'partial') { s.pending++; s.totalDue += Number(inv.total_amount) || 0 }
      })
      setStats(s)
    }
  }

  async function loadInvoices() {
    setLoading(true)
    let query = supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, status, issued_date, due_date, description, students(first_name, last_name)', { count: 'exact' })
      .order('issued_date', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) query = query.ilike('invoice_number', `%${search}%`)

    const { data, count } = await query
    setInvoices(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const fmt = (n) => `RD$${Number(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
  const totalPages = Math.ceil(total / pageSize)

  const statusMap = {
    paid: { label: 'Pagado', cls: 'badge-success' },
    pending: { label: 'Pendiente', cls: 'badge-warning' },
    overdue: { label: 'Vencido', cls: 'badge-danger' },
    partial: { label: 'Parcial', cls: 'badge-info' },
    draft: { label: 'Borrador', cls: 'badge-info' },
    cancelled: { label: 'Cancelado', cls: 'badge-danger' },
  }

  return (
    <div className="animate-in">
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Pagos y Facturación</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Clock, label: 'Pendientes', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
          { icon: CheckCircle2, label: 'Pagados', value: stats.paid, color: '#059669', bg: '#ecfdf5' },
          { icon: AlertTriangle, label: 'Vencidos', value: stats.overdue, color: '#dc2626', bg: '#fef2f2' },
          { icon: DollarSign, label: 'Por Cobrar', value: fmt(stats.totalDue), color: '#4f46e5', bg: '#eef2ff', isText: true },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: s.isText ? 16 : 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'pending', 'paid', 'overdue', 'partial'].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setStatusFilter(s); setPage(0) }}>
            {s === 'all' ? 'Todos' : statusMap[s]?.label || s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', position: 'relative', width: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Buscar factura..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ paddingLeft: 32, fontSize: 12, height: 34 }} />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Factura', 'Estudiante', 'Monto', 'Emitida', 'Vence', 'Estado'].map(h => (
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
              ) : invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{inv.students?.first_name} {inv.students?.last_name}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(inv.total_amount)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{inv.issued_date ? new Date(inv.issued_date).toLocaleDateString('es-DO') : '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('es-DO') : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${statusMap[inv.status]?.cls || 'badge-info'}`}>
                      {statusMap[inv.status]?.label || inv.status}
                    </span>
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
