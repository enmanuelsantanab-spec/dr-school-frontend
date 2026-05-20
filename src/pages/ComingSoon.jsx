import { Construction } from 'lucide-react'

export default function ComingSoon({ title }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 400, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--accent-light)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}>
        <Construction size={28} color="var(--accent)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
        Esta sección está en desarrollo. Próximamente disponible.
      </p>
    </div>
  )
}
