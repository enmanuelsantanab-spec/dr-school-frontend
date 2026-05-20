import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, Search, ChevronLeft, ChevronRight, Calendar, DollarSign, Users } from 'lucide-react'

export default function Overdue() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ count: 0, totalOwed: 0, avgDays: 0, studentsAffected: 0 })
  const pageSize = 15

  useEffect(() => { loadOverdue() }, [page, search])
  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const { data } = await supabase
      .from('invoices')
      .select('id, balance_due, due_date, student_id')
      .eq('status', 'overdue')

    if (data) {
      const today = new Date()
      const totalOwed = data.reduce((sum, inv) => sum + (Number(inv.balance_due) || 0), 0)
      const days = data.map(inv => Math.floor((today - new Date(inv.due_date)) / 86400000))
      const avgDays = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0
      const uniqueStudents = new Set(data.map(i => i.student_id)).size
      setStats({ count: data.length, totalOwed, avgDays, studentsAffected: uniqueStudents })
    }
  }

  async function loadOverdue() {
    setLoading(true)
    let query = supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, balance_due, due_date, issued_date, concept, late_fee_amount, students(first_name, last_name, student_code)', { count: 'exact' })
      .eq('status', 'overdue')
      .order('due_date', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,concept.ilike.%${search}%`)
    }

    const { data, count } = await query
    setInvoices(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  function daysPastDue(dueDate) {
    return Math.floor((new Date() - new Date(dueDate)) / 86400000)
  }

  function daysColor(days) {
    if (days > 60) return '#dc2626'
    if (days > 30) return '#ea580c'
    if (days > 15) return '#d97706'
    return '#eab308'
  }

  function fmt(n) {
    return 'RD$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Pagos Atrasados</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Facturas vencidas pendientes de cobro
        </p>
      </div>

      {/* Alert Banner */}
      {stats.count > 0 && (
        <div style={{
          padding: '14px 20px', marginBottom: 20, borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #fef2f2, #fff7ed)', border: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <AlertTriangle size={20} color="#dc2626" />
          <span style={{ fontSize: 14, color: '#991b1b' }}>
            <strong>{stats.count}</strong> facturas vencidas por un total de <strong>{fmt(stats.totalOwed)}</strong> — {stats.studentsAffected} estudiantes afectados
          </span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Facturas Vencidas</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{stats.count}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#ea580c" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Monto Adeudado</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ea580c' }}>{fmt(stats.totalOwed)}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Promedio Días Vencidos</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{stats.avgDays}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Estudiantes Afectados</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0284c7' }}>{stats.studentsAffected}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="input" placeholder="Buscar por factura o concepto..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Factura</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Estudiante</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Concepto</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Adeudado</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Mora</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Vencimiento</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Días</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const days = daysPastDue(inv.due_date)
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{inv.invoice_number}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{inv.students?.first_name} {inv.students?.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.students?.student_code}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.concept}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(inv.total_amount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#dc2626', fontFamily: 'monospace' }}>{fmt(inv.balance_due)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{fmt(inv.late_fee_amount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{new Date(inv.due_date).toLocaleDateString('es-DO')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                        color: '#fff', background: daysColor(days),
                      }}>
                        {days}d
                      </span>
                    </td>
                  </tr>
                )
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No hay facturas vencidas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
