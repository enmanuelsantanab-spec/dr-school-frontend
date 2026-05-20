import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, Search, CheckCircle2, AlertCircle, Shield, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react'

export default function CreateUser() {
  const [form, setForm] = useState({ email: '', password: '', role: 'teacher', linkType: 'staff', linkId: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [guardianList, setGuardianList] = useState([])
  const [searchStaff, setSearchStaff] = useState('')
  const [searchGuardian, setSearchGuardian] = useState('')
  const [existingUsers, setExistingUsers] = useState([])

  useEffect(() => {
    loadStaff()
    loadGuardians()
    loadExistingUsers()
  }, [])

  async function loadStaff() {
    const { data } = await supabase
      .from('staff')
      .select('id, first_name, last_name, email, auth_user_id, staff_roles(name_es)')
      .order('last_name')
    setStaffList(data || [])
  }

  async function loadGuardians() {
    const { data } = await supabase
      .from('guardians')
      .select('id, first_name, last_name, email, phone_primary, auth_user_id')
      .order('last_name')
    setGuardianList(data || [])
  }

  async function loadExistingUsers() {
    // Load staff and guardians that already have auth accounts
    const { data: staff } = await supabase
      .from('staff')
      .select('id, first_name, last_name, email, auth_user_id, staff_roles(name_es)')
      .not('auth_user_id', 'is', null)
    const { data: guardians } = await supabase
      .from('guardians')
      .select('id, first_name, last_name, email, auth_user_id')
      .not('auth_user_id', 'is', null)
    setExistingUsers([
      ...(staff || []).map(s => ({ ...s, type: 'staff', role: s.staff_roles?.name_es })),
      ...(guardians || []).map(g => ({ ...g, type: 'guardian', role: 'Padre/Madre' })),
    ])
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    const specials = '!@#$%'
    let pwd = ''
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
    pwd += specials[Math.floor(Math.random() * specials.length)]
    pwd += Math.floor(Math.random() * 10)
    setForm(f => ({ ...f, password: pwd }))
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }

  // Auto-set role based on link type
  function handleLinkTypeChange(linkType) {
    const roleMap = { staff: 'teacher', guardian: 'parent' }
    setForm(f => ({ ...f, linkType, role: roleMap[linkType] || f.role, linkId: '' }))
  }

  // Auto-fill email when selecting a person
  function handlePersonSelect(person) {
    setForm(f => ({
      ...f,
      linkId: person.id,
      email: person.email || f.email,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // 1. Create the auth user via Supabase Auth admin (requires service role in production)
      // For now, use signUp which works with anon key
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { role: form.role },
        }
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('No se pudo crear el usuario')

      // 2. Link to staff or guardian record
      if (form.linkId) {
        const table = form.linkType === 'staff' ? 'staff' : 'guardians'
        const { error: linkError } = await supabase
          .from(table)
          .update({ auth_user_id: userId })
          .eq('id', form.linkId)

        if (linkError) throw linkError
      }

      setResult({
        success: true,
        message: `Usuario creado exitosamente`,
        details: {
          email: form.email,
          password: form.password,
          role: form.role,
          userId,
        }
      })

      // Refresh lists
      loadStaff()
      loadGuardians()
      loadExistingUsers()

      // Reset form (keep role/linkType)
      setForm(f => ({ ...f, email: '', password: '', linkId: '' }))
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Error al crear usuario',
      })
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'admin', label: 'Administrador', desc: 'Acceso completo al sistema', color: '#4f46e5' },
    { value: 'secretary', label: 'Secretaria', desc: 'Gestión de estudiantes y pagos', color: '#0891b2' },
    { value: 'teacher', label: 'Profesor(a)', desc: 'Calificaciones y asistencia', color: '#059669' },
    { value: 'parent', label: 'Padre/Madre', desc: 'Ver datos de sus hijos', color: '#d97706' },
  ]

  const filteredStaff = staffList.filter(s =>
    !s.auth_user_id &&
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchStaff.toLowerCase())
  )

  const filteredGuardians = guardianList.filter(g =>
    !g.auth_user_id &&
    `${g.first_name} ${g.last_name}`.toLowerCase().includes(searchGuardian.toLowerCase())
  )

  const personList = form.linkType === 'staff' ? filteredStaff : filteredGuardians
  const personSearch = form.linkType === 'staff' ? searchStaff : searchGuardian
  const setPersonSearch = form.linkType === 'staff' ? setSearchStaff : setSearchGuardian

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Crear Usuario</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Crea cuentas de acceso para personal y acudientes del colegio
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="create-user-grid">
        {/* FORM */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} color="var(--accent)" /> Nuevo Usuario
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Link Type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Tipo de Persona
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'staff', label: 'Personal' },
                  { value: 'guardian', label: 'Acudiente' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    className={`btn btn-sm ${form.linkType === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleLinkTypeChange(opt.value)}
                    style={{ flex: 1, justifyContent: 'center' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Person selector */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Vincular a {form.linkType === 'staff' ? 'Personal' : 'Acudiente'}
              </label>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input className="input" placeholder="Buscar por nombre..."
                  value={personSearch} onChange={e => setPersonSearch(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 13, height: 36 }} />
              </div>
              <div style={{
                maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)',
              }}>
                {personList.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
                    {form.linkType === 'staff' ? 'Todo el personal ya tiene cuenta' : 'Todos los acudientes ya tienen cuenta'}
                  </div>
                ) : personList.slice(0, 20).map(p => (
                  <div key={p.id}
                    onClick={() => handlePersonSelect(p)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                      borderBottom: '1px solid var(--border-light)',
                      background: form.linkId === p.id ? 'var(--accent-light)' : 'transparent',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (form.linkId !== p.id) e.currentTarget.style.background = '#f1f5f9' }}
                    onMouseLeave={e => { if (form.linkId !== p.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div>
                      <span style={{ fontWeight: 500 }}>{p.first_name} {p.last_name}</span>
                      {p.staff_roles && <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 8 }}>{p.staff_roles.name_es}</span>}
                    </div>
                    {form.linkId === p.id && <CheckCircle2 size={16} color="var(--accent)" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Role */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Rol en el Sistema
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {roleOptions.map(r => (
                  <div key={r.value}
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      padding: '10px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: `2px solid ${form.role === r.value ? r.color : 'var(--border)'}`,
                      background: form.role === r.value ? `${r.color}08` : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.role === r.value ? r.color : 'var(--text-primary)' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Correo Electrónico
              </label>
              <input className="input" type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="correo@ejemplo.com" />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Contraseña Temporal</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={generatePassword}
                  style={{ fontSize: 12, padding: '4px 8px', gap: 4 }}>
                  <RefreshCw size={12} /> Generar
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPassword ? 'text' : 'password'} required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres" minLength={6}
                  style={{ paddingRight: 80 }} />
                <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 2 }}>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 4 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {form.password && (
                    <button type="button" onClick={() => copyToClipboard(form.password)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 4 }}>
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading || !form.email || !form.password}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 'var(--radius-md)',
              background: result.success ? 'var(--success-light)' : 'var(--danger-light)',
              border: `1px solid ${result.success ? '#a7f3d0' : '#fecaca'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {result.success ? <CheckCircle2 size={18} color="var(--success)" /> : <AlertCircle size={18} color="var(--danger)" />}
                <span style={{ fontWeight: 600, fontSize: 14, color: result.success ? 'var(--success)' : 'var(--danger)' }}>
                  {result.message}
                </span>
              </div>
              {result.details && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div><strong>Email:</strong> {result.details.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>Contraseña:</strong>
                    <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{result.details.password}</code>
                    <button onClick={() => copyToClipboard(result.details.password)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 2 }}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <div><strong>Rol:</strong> {roleOptions.find(r => r.value === result.details.role)?.label}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* EXISTING USERS */}
        <div className="card" style={{ padding: 0, alignSelf: 'start' }}>
          <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Usuarios Existentes</h3>
            <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{existingUsers.length}</span>
          </div>
          {existingUsers.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
              No hay usuarios creados aún
            </div>
          ) : (
            <div>
              {existingUsers.map((u, i) => (
                <div key={u.id} style={{
                  padding: '12px 20px', borderTop: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: u.type === 'staff' ? 'var(--accent-light)' : '#fffbeb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600,
                    color: u.type === 'staff' ? 'var(--accent)' : '#d97706',
                  }}>
                    {u.first_name?.[0]}{u.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.first_name} {u.last_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.email || 'Sin email'}</div>
                  </div>
                  <span className={`badge ${u.type === 'staff' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                    {u.role || u.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .create-user-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
