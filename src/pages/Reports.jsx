import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('607')
  const [data607, setData607] = useState([])
  const [data606, setData606] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('all')
  const [periods, setPeriods] = useState([])
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [r607, r606] = await Promise.all([
      supabase.from('v_dgii_607').select('*'),
      supabase.from('v_dgii_606').select('*'),
    ])
    const d607 = r607.data || []
    const d606 = r606.data || []
    setData607(d607)
    setData606(d606)

    // Extract unique periods
    const allPeriods = [...new Set([...d607.map(r => r.periodo), ...d606.map(r => r.periodo)])].filter(Boolean).sort().reverse()
    setPeriods(allPeriods)
    setLoading(false)
  }

  function fmt(n) {
    return 'RD$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('es-DO') : '—'
  }

  function exportCSV(data, filename) {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h] ?? ''
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      }).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const current607 = periodFilter === 'all' ? data607 : data607.filter(r => r.periodo === periodFilter)
  const current606 = periodFilter === 'all' ? data606 : data606.filter(r => r.periodo === periodFilter)

  const activeData = activeTab === '607' ? current607 : current606
  const paged = activeData.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(activeData.length / pageSize)

  // Summary totals
  const total607 = current607.reduce((s, r) => s + Number(r.monto_total || 0), 0)
  const total606 = current606.reduce((s, r) => s + Number(r.monto_total || 0), 0)
  const itbis607 = current607.reduce((s, r) => s + Number(r.itbis_facturado || 0), 0)
  const itbis606 = current606.reduce((s, r) => s + Number(r.itbis_facturado || 0), 0)

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Reportes DGII</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Formatos 607 (Ingresos) y 606 (Compras) para la DGII
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const data = activeTab === '607' ? current607 : current606
          exportCSV(data, `dgii_${activeTab}_${periodFilter || 'todos'}.csv`)
        }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>607 — Total Ingresos</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>{fmt(total607)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{current607.length} registros · ITBIS: {fmt(itbis607)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>606 — Total Compras</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ea580c', marginTop: 4 }}>{fmt(total606)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{current606.length} registros · ITBIS: {fmt(itbis606)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Períodos Disponibles</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{periods.length}</div>
        </div>
      </div>

      {/* Tab + Period Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
          <button className={`btn btn-sm ${activeTab === '607' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('607'); setPage(0) }}>
            <FileText size={14} /> 607 — Ingresos
          </button>
          <button className={`btn btn-sm ${activeTab === '606' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('606'); setPage(0) }}>
            <FileText size={14} /> 606 — Compras
          </button>
        </div>
        <select className="input" value={periodFilter}
          onChange={e => { setPeriodFilter(e.target.value); setPage(0) }}
          style={{ width: 'auto', fontSize: 13, padding: '6px 12px' }}>
          <option value="all">Todos los períodos</option>
          {periods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</div>
        ) : activeTab === '607' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Período</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>NCF</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>RNC/Cédula</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Razón Social</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Fecha</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Monto</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>ITBIS</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-info">{r.periodo}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>{r.ncf || '—'}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>{r.rnc_cedula || '—'}</td>
                  <td style={{ padding: '10px 14px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.razon_social || '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtDate(r.fecha_comprobante)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(r.monto_antes_itbis)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(r.itbis_facturado)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{fmt(r.monto_total)}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay registros</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Período</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>NCF</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>RNC/Cédula</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Razón Social</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Categoría</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Fecha</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Pago</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Monto</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>ITBIS</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-warning">{r.periodo}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>{r.ncf || '—'}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>{r.rnc_cedula || '—'}</td>
                  <td style={{ padding: '10px 14px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.razon_social || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11 }}>{r.categoria || '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtDate(r.fecha_comprobante)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11 }}>{r.forma_pago || '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(r.monto_antes_itbis)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(r.itbis_facturado)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{fmt(r.monto_total)}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay registros</td></tr>
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
