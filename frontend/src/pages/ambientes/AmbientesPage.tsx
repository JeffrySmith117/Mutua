import { Link } from 'react-router-dom'

export default function AmbientesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cor-primaria-escura)' }}>
          Espaços e Salas da Mútua-PI
        </h1>
        <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.875rem' }}>
          Reserve estações no Coworking, salas de reuniões e auditório institucional.
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
        <div style={{ fontSize: '3rem' }}>🏢</div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria-escura)' }}>
          Catálogo Detalhado de Ambientes
        </h2>
        <p style={{ color: 'var(--cor-texto-secundario)', maxWidth: '500px', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Esta funcionalidade será entregue na branch <code>feature/listagem-ambientes</code> com seleção de horários, filtros por capacidade e calendário interativo de disponibilidade.
        </p>
        <Link to="/" className="btn btn-primario" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
          Voltar ao Painel Inicial
        </Link>
      </div>
    </div>
  )
}
