import { Link } from 'react-router-dom'

export default function MinhasReservasPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cor-primaria-escura)' }}>
          Minhas Reservas e Solicitações
        </h1>
        <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.875rem' }}>
          Histórico e gestão de agendamentos de salas, coworking e equipamentos.
        </p>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-lg)',
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '3rem' }}>📅</div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria-escura)' }}>
          Central de Reservas do Associado
        </h2>
        <p style={{ color: 'var(--cor-texto-secundario)', maxWidth: '500px', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Esta funcionalidade permitirá cancelar reservas, exportar comprovante em PDF e realizar check-in presencial via QR Code.
        </p>
        <Link to="/" className="btn btn-primario" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
          Voltar ao Painel Inicial
        </Link>
      </div>
    </div>
  )
}
