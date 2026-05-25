import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import {
  Search, ChevronLeft, ChevronRight, X, User, Plus, Pencil,
  Trash2, UserPlus, Save, AlertTriangle, Check
} from 'lucide-react'

/* ── grade levels cache ─────────────────────────────────── */
const GRADE_LEVELS = [
  { id: 'd9c6121d-5288-49cc-9cc0-855fcda6883a', name: 'Maternal' },
  { id: '1de5dec0-6253-4a5f-bd36-d55094e74607', name: 'Pre-Kinder' },
  { id: '6fc2bc63-d4b4-4d5a-b532-1c234b1b6b8d', name: 'Kinder' },
  { id: '280f042d-c6c5-4ce6-984f-7562359cb62d', name: '1ro Primaria' },
  { id: 'c39105bc-2015-46c3-ad08-1ef75eac7d1d', name: '2do Primaria' },
  { id: 'fa39695f-64a7-49c6-8091-804f410adc9b', name: '3ro Primaria' },
  { id: 'c51b7eed-b092-4c77-b3a4-7f9bf6712f1b', name: '4to Primaria' },
  { id: '1663aaa2-0b68-4e79-9d1b-64c2d76c61b4', name: '5to Primaria' },
  { id: '26febf18-3a8e-4f29-b345-5d833a42cb02', name: '6to Primaria' },
  { id: '25181e27-065f-4827-9156-69f0c56db402', name: '7mo Secundaria' },
  { id: '027cde38-8732-4c49-928e-3b5865239da6', name: '8vo Secundaria' },
  { id: 'e26bd308-bfc2-415d-8a02-538fd7cb4348', name: '1ro Secundaria' },
  { id: '64de1964-41d9-4bbb-bc5d-c6106a4b0619', name: '2do Secundaria' },
  { id: '67ae78f5-2f52-4f5d-bd5f-e72ba3e2a4ee', name: '3ro Secundaria' },
  { id: 'e158755d-2a2b-438e-b4f5-fcc9e6118ce0', name: '4to Secundaria' },
]

const RELATIONSHIPS = [
  { value: 'mother', label: 'Madre' },
  { value: 'father', label: 'Padre' },
  { value: 'grandmother', label: 'Abuela' },
  { value: 'grandfather', label: 'Abuelo' },
  { value: 'uncle', label: 'T\u00edo' },
  { value: 'aunt', label: 'T\u00eda' },
  { value: 'sibling', label: 'Hermano/a' },
  { value: 'legal_guardian', label: 'Tutor Legal' },
  { value: 'other', label: 'Otro' },
]

const STATUS_LABELS = {
  active: 'Activo', inactive: 'Inactivo', graduated: 'Graduado',
  transferred: 'Transferido', withdrawn: 'Retirado',
}

const emptyStudent = {
  first_name: '', last_name: '', date_of_birth: '', gender: 'M',
  nationality: 'Dominicana', student_code: '', enrollment_status: 'active',
  current_grade_level_id: '', address: '', city: '', province: '',
  phone: '', email: '', medical_notes: '',
}

const emptyGuardian = {
  first_name: '', last_name: '', cedula: '', phone_primary: '',
  phone_secondary: '', email: '', address: '', city: '', province: '',
  occupation: '', workplace: '',
}

/* ── helper: form field ─────────────────────────────────── */
function Field({ label, required, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500,
        color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.02em',
      }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

/* ── toast ──────────────────────────────────────────────── */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [])
  const bg = type === 'success' ? 'var(--success)' : 'var(--danger)'
  const Icon = type === 'success' ? Check : AlertTriangle
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 300,
      background: bg, color: '#fff', padding: '12px 20px',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500,
      animation: 'modalSlideUp 0.3s ease',
    }}>
      <Icon size={18} />
      {message}
    </div>
  )
}

/* ── date picker with dropdowns ─────────────────────────── */
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function DatePicker({ value, onChange, selectStyle }) {
  const parts = value ? value.split('-') : ['', '', '']
  const year = parts[0] || ''
  const month = parts[1] || ''
  const day = parts[2] || ''

  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= currentYear - 25; y--) years.push(y)

  const daysInMonth = (year && month) ? new Date(parseInt(year), parseInt(month), 0).getDate() : 31
  const days = []
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  function update(y, m, d) {
    if (y && m && d) {
      onChange(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    } else {
      onChange('')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 6 }}>
      <select style={selectStyle} value={day}
        onChange={e => update(year, month, e.target.value)}>
        <option value="">D\u00eda</option>
        {days.map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
      </select>
      <select style={selectStyle} value={month}
        onChange={e => update(year, e.target.value, day)}>
        <option value="">Mes</option>
        {MONTHS.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
      </select>
      <select style={selectStyle} value={year}
        onChange={e => update(e.target.value, month, day)}>
        <option value="">A\u00f1o</option>
        {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
      </select>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const [selected, setSelected] = useState(null)
  const [guardians, setGuardians] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ ...emptyStudent })
  const [saving, setSaving] = useState(false)

  const [guardianModalOpen, setGuardianModalOpen] = useState(false)
  const [guardianForm, setGuardianForm] = useState({ ...emptyGuardian })
  const [guardianRelationship, setGuardianRelationship] = useState('mother')
  const [guardianIsPrimary, setGuardianIsPrimary] = useState(false)
  const [editingGuardianId, setEditingGuardianId] = useState(null)
  const [savingGuardian, setSavingGuardian] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadStudents() }, [page, search])

  async function loadStudents() {
    setLoading(true)
    let query = supabase
      .from('students')
      .select('id, first_name, last_name, student_code, gender, date_of_birth, enrollment_status, nationality, current_grade_level_id, address, city, province, phone, email, medical_notes, created_at', { count: 'exact' })
      .is('deleted_at', null)
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
    setDeleteConfirm(false)
    const { data } = await supabase
      .from('student_guardians')
      .select('id, relationship, is_primary_contact, guardian_id, guardians(id, first_name, last_name, cedula, phone_primary, phone_secondary, email, address, city, province, occupation, workplace)')
      .eq('student_id', student.id)
    setGuardians(data || [])
  }

  async function saveStudent() {
    setSaving(true)
    const payload = { ...form }
    if (!payload.current_grade_level_id) delete payload.current_grade_level_id
    if (!payload.student_code) delete payload.student_code

    let error
    if (editMode && selected) {
      const { error: e } = await supabase.from('students').update(payload).eq('id', selected.id)
      error = e
    } else {
      const { error: e } = await supabase.from('students').insert(payload)
      error = e
    }
    setSaving(false)
    if (error) {
      setToast({ message: `Error: ${error.message}`, type: 'error' })
    } else {
      setToast({ message: editMode ? 'Estudiante actualizado' : 'Estudiante agregado' })
      setModalOpen(false)
      loadStudents()
      if (editMode && selected) {
        const { data } = await supabase.from('students').select('*').eq('id', selected.id).single()
        if (data) setSelected(data)
      }
    }
  }

  async function deleteStudent() {
    setDeleting(true)
    const { error } = await supabase.from('students').update({ deleted_at: new Date().toISOString() }).eq('id', selected.id)
    setDeleting(false)
    if (error) { setToast({ message: `Error: ${error.message}`, type: 'error' }) }
    else { setToast({ message: 'Estudiante eliminado' }); setSelected(null); loadStudents() }
  }

  async function saveGuardian() {
    setSavingGuardian(true)
    if (editingGuardianId) {
      const { error } = await supabase.from('guardians').update(guardianForm).eq('id', editingGuardianId)
      if (error) { setToast({ message: `Error: ${error.message}`, type: 'error' }); setSavingGuardian(false); return }
      await supabase.from('student_guardians').update({ relationship: guardianRelationship, is_primary_contact: guardianIsPrimary }).eq('student_id', selected.id).eq('guardian_id', editingGuardianId)
    } else {
      const { data, error } = await supabase.from('guardians').insert(guardianForm).select('id').single()
      if (error) { setToast({ message: `Error: ${error.message}`, type: 'error' }); setSavingGuardian(false); return }
      const { error: linkError } = await supabase.from('student_guardians').insert({ student_id: selected.id, guardian_id: data.id, relationship: guardianRelationship, is_primary_contact: guardianIsPrimary })
      if (linkError) { setToast({ message: `Error vinculando: ${linkError.message}`, type: 'error' }); setSavingGuardian(false); return }
    }
    setSavingGuardian(false)
    setGuardianModalOpen(false)
    setToast({ message: editingGuardianId ? 'Acudiente actualizado' : 'Acudiente agregado' })
    openDetail(selected)
  }

  async function removeGuardian(linkId) {
    const { error } = await supabase.from('student_guardians').delete().eq('id', linkId)
    if (error) { setToast({ message: `Error: ${error.message}`, type: 'error' }) }
    else { setToast({ message: 'Acudiente removido' }); openDetail(selected) }
  }

  function openAddStudent() { setForm({ ...emptyStudent }); setEditMode(false); setModalOpen(true) }

  function openEditStudent(student) {
    setForm({
      first_name: student.first_name || '', last_name: student.last_name || '',
      date_of_birth: student.date_of_birth || '', gender: student.gender || 'M',
      nationality: student.nationality || 'Dominicana', student_code: student.student_code || '',
      enrollment_status: student.enrollment_status || 'active',
      current_grade_level_id: student.current_grade_level_id || '',
      address: student.address || '', city: student.city || '', province: student.province || '',
      phone: student.phone || '', email: student.email || '', medical_notes: student.medical_notes || '',
    })
    setEditMode(true); setModalOpen(true)
  }

  function openAddGuardian() { setGuardianForm({ ...emptyGuardian }); setGuardianRelationship('mother'); setGuardianIsPrimary(false); setEditingGuardianId(null); setGuardianModalOpen(true) }

  function openEditGuardian(link) {
    const g = link.guardians
    setGuardianForm({ first_name: g.first_name || '', last_name: g.last_name || '', cedula: g.cedula || '', phone_primary: g.phone_primary || '', phone_secondary: g.phone_secondary || '', email: g.email || '', address: g.address || '', city: g.city || '', province: g.province || '', occupation: g.occupation || '', workplace: g.workplace || '' })
    setGuardianRelationship(link.relationship || 'other'); setGuardianIsPrimary(link.is_primary_contact || false); setEditingGuardianId(g.id); setGuardianModalOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)
  const gradeName = (id) => GRADE_LEVELS.find(g => g.id === id)?.name || '\u2014'
  const statusBadge = (s) => {
    const map = { active: 'badge-success', inactive: 'badge-warning', graduated: 'badge-info', transferred: 'badge-danger', withdrawn: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-info'}`}>{STATUS_LABELS[s] || s}</span>
  }
  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none', transition: 'border-color 0.15s' }
  const selectStyle = { ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Estudiantes</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{total.toLocaleString()} estudiantes registrados</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input className="input" placeholder="Buscar por nombre o c\u00f3digo..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} style={{ paddingLeft: 36, fontSize: 13, height: 40 }} />
          </div>
          <button className="btn btn-primary" onClick={openAddStudent} style={{ height: 40 }}><Plus size={18} /> Agregar</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nombre', 'C\u00f3digo', 'Grado', 'G\u00e9nero', 'Nacimiento', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--bg-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No se encontraron estudiantes</td></tr>
              ) : students.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }} onClick={() => openDetail(s)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>{s.first_name?.[0]}{s.last_name?.[0]}</div>
                      <span style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }} onClick={() => openDetail(s)}>{s.student_code || '\u2014'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} onClick={() => openDetail(s)}>{gradeName(s.current_grade_level_id)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} onClick={() => openDetail(s)}>{s.gender === 'M' ? 'Masculino' : 'Femenino'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} onClick={() => openDetail(s)}>{s.date_of_birth ? new Date(s.date_of_birth + 'T00:00:00').toLocaleDateString('es-DO') : '\u2014'}</td>
                  <td style={{ padding: '12px 16px' }} onClick={() => openDetail(s)}>{statusBadge(s.enrollment_status)}</td>
                  <td style={{ padding: '12px 16px' }}><button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); openEditStudent(s) }} title="Editar" style={{ padding: 6 }}><Pencil size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>P\u00e1gina {page + 1} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL SLIDE-OVER */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} onClick={() => setSelected(null)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 460, background: 'var(--bg-card)', boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', overflowY: 'auto', animation: 'slideFromRight 0.25s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Detalle del Estudiante</h2>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEditStudent(selected)} title="Editar"><Pencil size={16} /></button>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 4 }}><X size={20} /></button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} color="var(--accent)" /></div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{selected.student_code || 'Sin c\u00f3digo'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'G\u00e9nero', value: selected.gender === 'M' ? 'Masculino' : 'Femenino' },
                  { label: 'Nacimiento', value: selected.date_of_birth ? new Date(selected.date_of_birth + 'T00:00:00').toLocaleDateString('es-DO') : '\u2014' },
                  { label: 'Nacionalidad', value: selected.nationality || '\u2014' },
                  { label: 'Estado', value: STATUS_LABELS[selected.enrollment_status] || selected.enrollment_status },
                  { label: 'Grado', value: gradeName(selected.current_grade_level_id) },
                  { label: 'Tel\u00e9fono', value: selected.phone || '\u2014' },
                  { label: 'Email', value: selected.email || '\u2014' },
                  { label: 'Direcci\u00f3n', value: [selected.address, selected.city, selected.province].filter(Boolean).join(', ') || '\u2014' },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {selected.medical_notes && (
                <div style={{ marginBottom: 24, padding: 14, background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>Notas M\u00e9dicas</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selected.medical_notes}</div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Acudientes</h3>
                <button className="btn btn-secondary btn-sm" onClick={openAddGuardian}><UserPlus size={14} /> Agregar</button>
              </div>
              {guardians.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>No hay acudientes registrados</div>
              ) : guardians.map((g, i) => (
                <div key={i} className="card" style={{ padding: 14, marginBottom: 8, background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {g.guardians?.first_name} {g.guardians?.last_name}
                        {g.is_primary_contact && <span className="badge badge-info" style={{ marginLeft: 8, fontSize: 11 }}>Principal</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        {RELATIONSHIPS.find(r => r.value === g.relationship)?.label || g.relationship}
                        {g.guardians?.phone_primary && ` \u2022 ${g.guardians.phone_primary}`}
                        {g.guardians?.email && ` \u2022 ${g.guardians.email}`}
                      </div>
                      {g.guardians?.cedula && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>C\u00e9dula: {g.guardians.cedula}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditGuardian(g)} style={{ padding: 4 }} title="Editar"><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeGuardian(g.id)} style={{ padding: 4, color: 'var(--danger)' }} title="Remover"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Cambiar Estado</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button key={key} className={`btn btn-sm ${selected.enrollment_status === key ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: 12 }} disabled={selected.enrollment_status === key}
                      onClick={async () => {
                        const { error } = await supabase.from('students').update({ enrollment_status: key }).eq('id', selected.id)
                        if (!error) { setToast({ message: `Estado cambiado a ${label}` }); setSelected({ ...selected, enrollment_status: key }); loadStudents() }
                      }}>{label}</button>
                  ))}
                </div>
                {!deleteConfirm ? (
                  <button className="btn btn-sm" onClick={() => setDeleteConfirm(true)} style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: 12 }}><Trash2 size={14} /> Eliminar Estudiante</button>
                ) : (
                  <div style={{ padding: 14, background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
                    <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 500, marginBottom: 10 }}>\u00bfEst\u00e1s seguro? Esta acci\u00f3n ocultar\u00e1 al estudiante de todas las listas.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-danger btn-sm" onClick={deleteStudent} disabled={deleting}>{deleting ? 'Eliminando...' : 'S\u00ed, eliminar'}</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <style>{`@keyframes slideFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        </div>
      )}

      {/* STUDENT ADD/EDIT MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Editar Estudiante' : 'Agregar Estudiante'} width={620}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveStudent} disabled={saving || !form.first_name || !form.last_name || !form.date_of_birth}>
            <Save size={16} /> {saving ? 'Guardando...' : editMode ? 'Actualizar' : 'Agregar Estudiante'}
          </button>
        </>}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Nombre" required><input style={inputStyle} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Ej: Juan" /></Field>
            <Field label="Apellido" required><input style={inputStyle} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Ej: P\u00e9rez" /></Field>
            <Field label="Fecha de Nacimiento" required>
              <DatePicker value={form.date_of_birth} selectStyle={selectStyle} onChange={v => setForm({ ...form, date_of_birth: v })} />
            </Field>
            <Field label="G\u00e9nero" required><select style={selectStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="M">Masculino</option><option value="F">Femenino</option></select></Field>
            <Field label="C\u00f3digo de Estudiante"><input style={inputStyle} value={form.student_code} onChange={e => setForm({ ...form, student_code: e.target.value })} placeholder="Ej: EST-001" /></Field>
            <Field label="Nacionalidad"><input style={inputStyle} value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} /></Field>
            <Field label="Grado Actual"><select style={selectStyle} value={form.current_grade_level_id} onChange={e => setForm({ ...form, current_grade_level_id: e.target.value })}><option value="">\u2014 Seleccionar \u2014</option>{GRADE_LEVELS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>
            <Field label="Estado"><select style={selectStyle} value={form.enrollment_status} onChange={e => setForm({ ...form, enrollment_status: e.target.value })}>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Direcci\u00f3n y Contacto</div>
            </div>
            <Field label="Direcci\u00f3n" span={2}><input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Calle, n\u00famero..." /></Field>
            <Field label="Ciudad"><input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Ej: Santo Domingo" /></Field>
            <Field label="Provincia"><input style={inputStyle} value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} placeholder="Ej: Distrito Nacional" /></Field>
            <Field label="Tel\u00e9fono"><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="809-000-0000" /></Field>
            <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" /></Field>
            <Field label="Notas M\u00e9dicas" span={2}><textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.medical_notes} onChange={e => setForm({ ...form, medical_notes: e.target.value })} placeholder="Alergias, condiciones, medicamentos..." /></Field>
          </div>
        </div>
      </Modal>

      {/* GUARDIAN ADD/EDIT MODAL */}
      <Modal open={guardianModalOpen} onClose={() => setGuardianModalOpen(false)} title={editingGuardianId ? 'Editar Acudiente' : 'Agregar Acudiente'} width={580}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setGuardianModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveGuardian} disabled={savingGuardian || !guardianForm.first_name || !guardianForm.last_name || !guardianForm.phone_primary}>
            <Save size={16} /> {savingGuardian ? 'Guardando...' : editingGuardianId ? 'Actualizar' : 'Agregar Acudiente'}
          </button>
        </>}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Nombre" required><input style={inputStyle} value={guardianForm.first_name} onChange={e => setGuardianForm({ ...guardianForm, first_name: e.target.value })} placeholder="Ej: Mar\u00eda" /></Field>
            <Field label="Apellido" required><input style={inputStyle} value={guardianForm.last_name} onChange={e => setGuardianForm({ ...guardianForm, last_name: e.target.value })} placeholder="Ej: Gonz\u00e1lez" /></Field>
            <Field label="Parentesco" required><select style={selectStyle} value={guardianRelationship} onChange={e => setGuardianRelationship(e.target.value)}>{RELATIONSHIPS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></Field>
            <Field label="C\u00e9dula"><input style={inputStyle} value={guardianForm.cedula} onChange={e => setGuardianForm({ ...guardianForm, cedula: e.target.value })} placeholder="000-0000000-0" /></Field>
            <Field label="Tel\u00e9fono Principal" required><input style={inputStyle} value={guardianForm.phone_primary} onChange={e => setGuardianForm({ ...guardianForm, phone_primary: e.target.value })} placeholder="809-000-0000" /></Field>
            <Field label="Tel\u00e9fono Secundario"><input style={inputStyle} value={guardianForm.phone_secondary} onChange={e => setGuardianForm({ ...guardianForm, phone_secondary: e.target.value })} placeholder="809-000-0000" /></Field>
            <Field label="Email" span={2}><input style={inputStyle} type="email" value={guardianForm.email} onChange={e => setGuardianForm({ ...guardianForm, email: e.target.value })} placeholder="correo@ejemplo.com" /></Field>
            <Field label="Direcci\u00f3n" span={2}><input style={inputStyle} value={guardianForm.address} onChange={e => setGuardianForm({ ...guardianForm, address: e.target.value })} placeholder="Calle, n\u00famero..." /></Field>
            <Field label="Ciudad"><input style={inputStyle} value={guardianForm.city} onChange={e => setGuardianForm({ ...guardianForm, city: e.target.value })} /></Field>
            <Field label="Provincia"><input style={inputStyle} value={guardianForm.province} onChange={e => setGuardianForm({ ...guardianForm, province: e.target.value })} /></Field>
            <Field label="Ocupaci\u00f3n"><input style={inputStyle} value={guardianForm.occupation} onChange={e => setGuardianForm({ ...guardianForm, occupation: e.target.value })} placeholder="Ej: Ingeniero" /></Field>
            <Field label="Lugar de Trabajo"><input style={inputStyle} value={guardianForm.workplace} onChange={e => setGuardianForm({ ...guardianForm, workplace: e.target.value })} /></Field>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={guardianIsPrimary} onChange={e => setGuardianIsPrimary(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Contacto principal</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
