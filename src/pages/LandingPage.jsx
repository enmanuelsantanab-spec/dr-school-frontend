import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  GraduationCap, Users, CreditCard, BarChart3, Shield,
  BookOpen, ArrowRight, Menu, X, ChevronRight, Star,
  CheckCircle2, Phone, Mail, MapPin, Clock
} from 'lucide-react'

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const { signIn, demoLogin } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true)
    try { await signIn(email, password); navigate('/dashboard') }
    catch (err) { setLoginError(err.message || 'Error al iniciar sesión') }
    finally { setLoginLoading(false) }
  }
  const handleDemo = (role) => { demoLogin(role); navigate('/dashboard') }

  const features = [
    { icon: Users, title: 'Gestión de Estudiantes', desc: 'Registro completo, historial académico, y seguimiento de más de 900 estudiantes desde Maternal hasta 8vo grado.' },
    { icon: BookOpen, title: 'Control Académico', desc: 'Calificaciones por trimestre, asistencia diaria, y reportes de rendimiento por sección y materia.' },
    { icon: CreditCard, title: 'Facturación y Pagos', desc: 'Facturación automática, seguimiento de pagos, mora automática, y reportes de cuentas por cobrar.' },
    { icon: BarChart3, title: 'Nómina y RRHH', desc: 'Cálculo automático de TSS, ISR, y deducciones. Generación de nómina mensual con un clic.' },
    { icon: Shield, title: 'Cumplimiento DGII', desc: 'Reportes 606 y 607 listos para exportar. Secuencias NCF automáticas para facturación fiscal.' },
    { icon: GraduationCap, title: 'Portal de Padres', desc: 'Los padres pueden ver calificaciones, asistencia y estado de pagos de sus hijos en tiempo real.' },
  ]

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)', height: 64,
        display: 'flex', alignItems: 'center', padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>DR School</span>
          </div>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="#features" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Funciones</a>
            <a href="#about" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Nosotros</a>
            <a href="#contact" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Contacto</a>
            <button className="btn btn-primary btn-sm" onClick={() => setLoginOpen(true)}>Iniciar Sesión</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 140, paddingBottom: 80, background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, fontSize: 13, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 500, marginBottom: 24 }}>
              <Star size={14} /> Sistema de Gestión Escolar
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Administra tu colegio con <span style={{ color: 'var(--accent)' }}>confianza</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 540 }}>
              Desde inscripciones hasta nómina, todo en una plataforma moderna diseñada para colegios dominicanos. Cumplimiento DGII incluido.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => setLoginOpen(true)}>Acceder al Sistema <ArrowRight size={18} /></button>
              <a href="#features" className="btn btn-secondary btn-lg">Ver Funciones</a>
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, marginTop: 72, background: 'var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            {[{ v: '909+', l: 'Estudiantes Activos' }, { v: '48', l: 'Secciones' }, { v: '23', l: 'Personal' }, { v: '16', l: 'Niveles Académicos' }].map((s, i) => (
              <div key={i} style={{ padding: '28px 24px', background: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Todo lo que necesitas</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>Un sistema integral que cubre cada aspecto de la gestión escolar.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <f.icon size={20} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>Diseñado para colegios dominicanos</h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
                Nuestro sistema entiende las necesidades del sistema educativo dominicano: cálculo de TSS e ISR, comprobantes fiscales NCF, y reportes DGII.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Cumplimiento con reportes DGII 606 y 607', 'Cálculo automático de TSS (SFS 3.04%, AFP 2.87%)', 'Secuencias NCF para facturación fiscal', 'Soporte multi-rol: Admin, Secretaria, Profesor, Padre'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-xl)', padding: 32, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.15)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 16 }}>RESUMEN DEL SISTEMA</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {[{ l: 'Estudiantes', v: '909' }, { l: 'Secciones', v: '48' }, { l: 'Personal', v: '23' }, { l: 'Materias', v: '10' }, { l: 'Niveles', v: '16' }, { l: 'Tablas', v: '36+' }].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 40 }}>Contáctanos</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {[
              { icon: Phone, label: 'Teléfono', value: '(809) 555-0100' },
              { icon: Mail, label: 'Email', value: 'info@drschool.do' },
              { icon: MapPin, label: 'Dirección', value: 'Santo Domingo, RD' },
              { icon: Clock, label: 'Horario', value: 'Lun-Vie 7:00-17:00' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <c.icon size={18} color="var(--text-secondary)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', background: 'var(--bg-sidebar)', color: '#94a3b8', textAlign: 'center', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <GraduationCap size={16} color="#6366f1" />
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>DR School</span>
        </div>
        © {new Date().getFullYear()} DR School. Todos los derechos reservados.
      </footer>

      {/* LOGIN MODAL */}
      {loginOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setLoginOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 36, width: '100%', maxWidth: 420, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <GraduationCap size={24} color="#fff" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Bienvenido</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Inicia sesión para acceder al sistema</p>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Correo Electrónico</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Contraseña</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              {loginError && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13 }}>{loginError}</div>}
              <button className="btn btn-primary" type="submit" disabled={loginLoading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
            <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>MODO DEMO</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { role: 'admin', label: 'Admin', color: '#4f46e5' },
                { role: 'secretary', label: 'Secretaria', color: '#0891b2' },
                { role: 'teacher', label: 'Profesor', color: '#059669' },
                { role: 'parent', label: 'Padre', color: '#d97706' },
              ].map(d => (
                <button key={d.role} className="btn btn-secondary btn-sm" onClick={() => handleDemo(d.role)} style={{ justifyContent: 'center', fontSize: 13 }}>
                  <ChevronRight size={14} color={d.color} /> {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  )
}
