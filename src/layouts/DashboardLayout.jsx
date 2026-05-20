import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, UserCog, GraduationCap, CreditCard,
  BookOpen, ClipboardList, Bell, ChevronLeft, ChevronRight,
  LogOut, Menu, X, Search, Settings, AlertTriangle, DollarSign, UserPlus, FileText
} from 'lucide-react'

const adminNav = [
  { id: 'overview', label: 'Panel General', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'students', label: 'Estudiantes', icon: Users, path: '/dashboard/students' },
  { id: 'staff', label: 'Personal', icon: UserCog, path: '/dashboard/staff' },
  { id: 'enrollments', label: 'Inscripciones', icon: ClipboardList, path: '/dashboard/enrollments' },
  { id: 'sections', label: 'Secciones', icon: GraduationCap, path: '/dashboard/sections' },
  { id: 'subjects', label: 'Materias', icon: BookOpen, path: '/dashboard/subjects' },
  { type: 'divider', label: 'Finanzas' },
  { id: 'payments', label: 'Pagos', icon: CreditCard, path: '/dashboard/payments' },
  { id: 'overdue', label: 'Pagos Atrasados', icon: AlertTriangle, path: '/dashboard/overdue' },
  { id: 'payroll', label: 'Nómina', icon: DollarSign, path: '/dashboard/payroll' },
  { type: 'divider', label: 'Sistema' },
  { id: 'users', label: 'Crear Usuario', icon: UserPlus, path: '/dashboard/create-user' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, path: '/dashboard/notifications' },
  { id: 'reports', label: 'Reportes DGII', icon: FileText, path: '/dashboard/reports' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { signOut(); navigate('/') }
  const roleLabel = { admin: 'Administrador', secretary: 'Secretaria', teacher: 'Profesor(a)', parent: 'Padre/Madre' }
  const sidebarWidth = collapsed ? 72 : 256

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Mobile overlay */}
      {mobileOpen && <div className="mobile-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={() => setMobileOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={mobileOpen ? 'sidebar-open' : ''} style={{
        width: sidebarWidth, flexShrink: 0, background: 'var(--bg-sidebar)', color: 'var(--text-sidebar)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50, overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', whiteSpace: 'nowrap' }}>DR School</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {adminNav.map((item, i) => {
            if (item.type === 'divider') {
              return !collapsed ? (
                <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '20px 12px 8px', whiteSpace: 'nowrap' }}>{item.label}</div>
              ) : <div key={i} style={{ height: 20 }} />
            }
            const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <button key={item.id} onClick={() => { navigate(item.path); setMobileOpen(false) }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: active ? 'var(--bg-sidebar-active)' : 'transparent',
                color: active ? '#fff' : 'var(--text-sidebar)',
                fontSize: 13.5, fontWeight: active ? 600 : 400, cursor: 'pointer',
                transition: 'all 0.15s', marginBottom: 2, whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-sidebar-hover)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--bg-sidebar-active)' : 'transparent' }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 8px', flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#c7d2fe' }}>
                {(user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email?.split('@')[0] || 'Usuario'}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{roleLabel[role] || role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={18} /> {!collapsed && 'Cerrar Sesión'}
          </button>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--text-sidebar)', fontSize: 13, cursor: 'pointer', marginTop: 2 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-sidebar-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Colapsar</>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.2s ease', minWidth: 0 }}>
        <header style={{ height: 64, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-trigger" onClick={() => setMobileOpen(true)} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', padding: 4 }}><Menu size={22} /></button>
            <div className="search-desktop" style={{ position: 'relative', width: 280 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input className="input" placeholder="Buscar..." style={{ paddingLeft: 36, fontSize: 13, height: 38, background: 'var(--bg-secondary)', border: '1px solid transparent' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" style={{ position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }} />
            </button>
            <button className="btn btn-ghost btn-sm"><Settings size={18} /></button>
          </div>
        </header>
        <main style={{ padding: 24 }}><Outlet /></main>
      </div>

      <style>{`
        @media (max-width: 1024px) { .collapse-btn { display: none !important; } .search-desktop { display: none !important; } }
        @media (max-width: 768px) {
          aside { transform: translateX(-100%); width: 256px !important; }
          aside.sidebar-open { transform: translateX(0); }
          .mobile-trigger { display: block !important; }
          div[style*="marginLeft"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
