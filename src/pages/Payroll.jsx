import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Banknote, ChevronDown, ChevronUp, Calendar, Users, TrendingUp, FileText } from 'lucide-react'

export default function Payroll() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRun, setExpandedRun] = useState(null)
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => { loadRuns() }, [])

  async function loadRuns() {
    setLoading(true)
    const { data } = await supabase
      .from('payroll_runs')
      .select('*')
      .order('period_start', { ascending: false })
    setRuns(data || [])
    setLoading(false)
    // Auto-expand first run
    if (data?.length) toggleRun(data[0].id)
  }

  async function toggleRun(runId) {
    if (expandedRun === runId) {
      setExpandedRun(null)
      return
    }
    setExpandedRun(runId)
    setLoadingItems(true)
    const { data } = await supabase
      .from('payroll_items')
      .select('*, staff(first_name, last_name, staff_roles(name_es))')
      .eq('payroll_run_id', runId)
      .order('net_pay', { ascending: false })
    setItems(data || [])
    setLoadingItems(false)
  }

  function fmt(n) {
    return 'RD$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: 'short' }) : '—'
  }

  const statusMap = {
    draft: { label: 'Borrador', cls: 'badge-secondary' },
    approved: { label: 'Aprobada', cls: 'badge-success' },
    processing: { label: 'Procesando', cls: 'badge-warning' },
    paid: { label: 'Pagada', cls: 'badge-success' },
    cancelled: { label: 'Cancelada', cls: 'badge-danger' },
  }

  // Summary stats from all runs
  const totalNet = runs.reduce((s, r) => s + (Number(r.total_net) || 0), 0)
  const totalGross = runs.reduce((s, r) => s + (Number(r.total_gross) || 0), 0)
  const totalDeductions = runs.reduce((s, r) => s + (Number(r.total_deductions) || 0), 0)

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Nómina</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Gestión de nómina y desglose de pagos al personal
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Nóminas Generadas</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{runs.length}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={18} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Total Neto Pagado</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>{fmt(totalNet)}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Total Bruto</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0284c7' }}>{fmt(totalGross)}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Total Deducciones</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}>{fmt(totalDeductions)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Runs */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</div>
      ) : runs.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay nóminas generadas</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {runs.map(run => {
            const expanded = expandedRun === run.id
            const st = statusMap[run.status] || statusMap.draft
            return (
              <div key={run.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Run Header */}
                <div onClick={() => toggleRun(run.id)} style={{
                  padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: expanded ? 'var(--bg-secondary)' : 'transparent', transition: 'background 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{run.payroll_number}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {fmtDate(run.period_start)} — {fmtDate(run.period_end)}
                      </div>
                    </div>
                    <span className={`badge ${st.cls}`} style={{ marginLeft: 8 }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Neto</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)' }}>{fmt(run.total_net)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bruto</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{fmt(run.total_gross)}</div>
                    </div>
                    {expanded ? <ChevronUp size={18} color="var(--text-tertiary)" /> : <ChevronDown size={18} color="var(--text-tertiary)" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {loadingItems ? (
                      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando detalles...</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Empleado</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Cargo</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Salario Base</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Bruto</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>SFS</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>AFP</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>ISR</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Deducciones</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Neto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '10px 16px', fontWeight: 500 }}>{item.staff?.first_name} {item.staff?.last_name}</td>
                              <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.staff?.staff_roles?.name_es || '—'}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(item.base_salary)}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(item.gross_pay)}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(item.sfs_employee)}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(item.afp_employee)}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(item.isr_amount)}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace', color: '#dc2626' }}>{fmt(item.total_deductions)}</td>
                              <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: 'var(--success)' }}>{fmt(item.net_pay)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: 'var(--bg-secondary)', fontWeight: 700 }}>
                            <td colSpan={2} style={{ padding: '12px 16px' }}>Total ({items.length} empleados)</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(items.reduce((s, i) => s + Number(i.base_salary || 0), 0))}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{fmt(items.reduce((s, i) => s + Number(i.gross_pay || 0), 0))}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(items.reduce((s, i) => s + Number(i.sfs_employee || 0), 0))}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(items.reduce((s, i) => s + Number(i.afp_employee || 0), 0))}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(items.reduce((s, i) => s + Number(i.isr_amount || 0), 0))}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{fmt(items.reduce((s, i) => s + Number(i.total_deductions || 0), 0))}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--success)' }}>{fmt(items.reduce((s, i) => s + Number(i.net_pay || 0), 0))}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}

                    {/* Employer costs */}
                    {!loadingItems && items.length > 0 && (
                      <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 24, fontSize: 12 }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>Costos patronales:</span>
                        <span><strong>SFS:</strong> {fmt(items.reduce((s, i) => s + Number(i.sfs_employer || 0), 0))}</span>
                        <span><strong>AFP:</strong> {fmt(items.reduce((s, i) => s + Number(i.afp_employer || 0), 0))}</span>
                        <span><strong>SRL:</strong> {fmt(items.reduce((s, i) => s + Number(i.srl_employer || 0), 0))}</span>
                        <span style={{ fontWeight: 700 }}><strong>Total Costo Empresa:</strong> {fmt(items.reduce((s, i) => s + Number(i.total_employer_cost || 0), 0))}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
