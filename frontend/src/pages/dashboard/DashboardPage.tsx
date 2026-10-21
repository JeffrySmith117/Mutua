import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './Dashboard.css'

interface ReservaResumo {
  id: string
  tipo: 'ambiente' | 'equipamento'
  titulo: string
  categoria: string
  data: string
  horario: string
  localOuPatrimonio: string
  status: 'confirmada' | 'pendente' | 'em_andamento' | 'concluida'
  protocolo: string
}

type CategoriaFiltro = 'todos' | 'reuniao' | 'coworking' | 'auditorio' | 'hub'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()

  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Associado'

  // Reservas simuladas para visualização imediata do associado
  const [reservas] = useState<ReservaResumo[]>([
    {
      id: 'res-1',
      tipo: 'ambiente',
      titulo: 'Sala de Reuniões Executiva A',
      categoria: 'Sala de Reunião',
      data: '21 de Outubro, 2026',
      horario: '14:00 às 17:00 (3h)',
      localOuPatrimonio: 'Sede CREA-PI • 2º Andar',
      status: 'confirmada',
      protocolo: 'MUT-2026-0849',
    },
    {
      id: 'res-2',
      tipo: 'equipamento',
      titulo: 'Drone DJI Phantom 4 RTK',
      categoria: 'Crea Tec HUB • Drone de Precisão',
      data: '24 a 26 de Outubro, 2026',
      horario: 'Retirada: 08:30 • Devolução: 17:00',
      localOuPatrimonio: 'Patrimônio: HUB-0042',
      status: 'pendente',
      protocolo: 'HUB-2026-0112',
    },
  ])

  // Próxima reserva mais urgente
  const proximaReserva = reservas.find((r) => r.status === 'confirmada' || r.status === 'pendente')

  // Filtro de catálogo em tempo real
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaFiltro>('todos')

  // Catálogo de ambientes e espaços
  const espacosDestaque = [
    {
      id: 'coworking-1',
      nome: 'Espaço Coworking Compartilhado',
      tipo: 'coworking' as const,
      capacidade: 24,
      descricao: 'Bancadas ergonômicas, Wi-Fi 6 de alta performance, café e tomadas individuais.',
      recursos: ['Wi-Fi 6', 'Climatizado', 'Tomadas Individuais', 'Café & Água'],
      disponivel: true,
      horarioFuncionamento: '08:00 às 18:00',
    },
    {
      id: 'sala-reuniao-a',
      nome: 'Sala de Reuniões Executiva A',
      tipo: 'reuniao' as const,
      capacidade: 8,
      descricao: 'Ambiente acústico privativo com tela 65" 4K para apresentações e videoconferência.',
      recursos: ['Smart TV 4K', 'Videoconferência', 'Quadro Branco', 'Climatizado'],
      disponivel: true,
      horarioFuncionamento: 'Blocos de 1h a 4h',
    },
    {
      id: 'auditorio-principal',
      nome: 'Auditório Cláudio Portella',
      tipo: 'auditorio' as const,
      capacidade: 60,
      descricao: 'Auditório equipado para palestras, seminários técnicos e reuniões magnas do CREA.',
      recursos: ['Projetor Laser', 'Sistema de Som', 'Microfones Sem Fio', 'Cabine Técnica'],
      disponivel: true,
      horarioFuncionamento: 'Turno matutino / vespertino',
    },
  ]

  // Catálogo de equipamentos Crea Tec HUB
  const equipamentosHub = [
    {
      id: 'eq-drone-phantom',
      nome: 'Drone DJI Phantom 4 RTK',
      tipo: 'hub' as const,
      categoria: 'Mapeamento e Topografia',
      patrimonio: 'HUB-0042',
      status: 'disponivel',
      descricao: 'Precisão centimétrica para aerofotogrametria e inspeções avançadas de engenharia.',
      requisito: 'Certificado ANAC / DECEA',
    },
    {
      id: 'eq-termografica-flir',
      nome: 'Câmera Termográfica FLIR E8-XT',
      tipo: 'hub' as const,
      categoria: 'Inspeção e Perícia Técnica',
      patrimonio: 'HUB-0019',
      status: 'disponivel',
      descricao: 'Diagnóstico visual de sobrecargas elétricas, perdas térmicas e umidade oculta.',
      requisito: 'Termo de Responsabilidade',
    },
    {
      id: 'eq-estacao-total',
      nome: 'Estação Total Leica FlexLine TS07',
      tipo: 'hub' as const,
      categoria: 'Agrimensura e Georreferenciamento',
      patrimonio: 'HUB-0008',
      status: 'em_uso',
      descricao: 'Medição precisa de distâncias com compensador quadrupilar e display touch.',
      requisito: 'Devolução prevista: 23/10',
    },
  ]

  // Itens filtrados com base na pílula selecionada
  const ambientesFiltrados =
    categoriaFiltro === 'todos'
      ? espacosDestaque
      : espacosDestaque.filter((item) => item.tipo === categoriaFiltro)

  const equipamentosFiltrados =
    categoriaFiltro === 'todos' || categoriaFiltro === 'hub' ? equipamentosHub : []

  return (
    <div className="dashboard-wrapper">
      {/* ============================================================
          1. HERO HEADER MINIMALISTA (Executive Clean)
          ============================================================ */}
      <header className="dashboard-hero-clean">
        <div className="hero-clean-info">
          <div className="hero-clean-badge">
            <span className="ponto-status-online" />
            <span>Mútua-PI • Sistema Integrado de Gestão</span>
          </div>
          <h1 className="hero-clean-titulo">
            Olá, <strong>{primeiroNome}</strong>
          </h1>
          <p className="hero-clean-subtitulo">
            {reservas.length > 0 ? (
              <>
                Você possui <strong>{reservas.length} reservas ativas</strong> registradas no seu
                cadastro.
              </>
            ) : (
              'Consulte disponibilidade e agende salas ou equipamentos em poucos segundos.'
            )}
          </p>
        </div>

        <div className="hero-clean-acoes">
          <button
            type="button"
            className="btn btn-cta"
            onClick={() => navigate('/ambientes')}
            id="btn-hero-reservar-ambiente"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="10" x2="12" y2="14" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            <span>+ Nova Reserva</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/equipamentos')}
            id="btn-hero-solicitar-hub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Solicitar HUB</span>
          </button>
        </div>
      </header>

      {/* ============================================================
          2. CARD CONTEXTUAL DE PRÓXIMO AGENDAMENTO (Se houver)
          ============================================================ */}
      {proximaReserva && (
        <section className="bloco-proxima-reserva" aria-label="Próxima reserva ativa">
          <div className="card-proxima-reserva">
            <div className="proxima-reserva-indicador" />
            <div className="proxima-reserva-conteudo">
              <div className="proxima-reserva-topo">
                <span className="badge-categoria-clean">
                  {proximaReserva.tipo === 'ambiente' ? 'Ambiente Físico' : 'Equipamento HUB'}
                </span>
                <span className={`badge-status-clean status-${proximaReserva.status}`}>
                  {proximaReserva.status === 'confirmada' && '● Confirmada'}
                  {proximaReserva.status === 'pendente' && '⏳ Em Análise'}
                </span>
              </div>

              <div className="proxima-reserva-principal">
                <div>
                  <h2 className="proxima-reserva-titulo">{proximaReserva.titulo}</h2>
                  <div className="proxima-reserva-meta">
                    <span>📅 {proximaReserva.data}</span>
                    <span className="divisor-ponto">•</span>
                    <span>⏰ {proximaReserva.horario}</span>
                    <span className="divisor-ponto">•</span>
                    <span>📍 {proximaReserva.localOuPatrimonio}</span>
                  </div>
                </div>

                <div className="proxima-reserva-acoes">
                  <span className="protocolo-tag">Protocolo: <code>{proximaReserva.protocolo}</code></span>
                  <Link to="/minhas-reservas" className="btn btn-secundario btn-sm">
                    Ver Comprovante
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          3. BARRA DE FILTRO POR ABAS / PÍLULAS
          ============================================================ */}
      <section className="bloco-catalogo-filtro">
        <div className="catalogo-filtro-cabecalho">
          <div>
            <h2 className="secao-titulo-clean">Catálogo e Disponibilidade</h2>
            <p className="secao-subtitulo-clean">
              Selecione uma categoria para visualizar os espaços e recursos prontos para uso
            </p>
          </div>

          <div className="filtro-pilulas" role="tablist" aria-label="Filtrar por categoria">
            <button
              type="button"
              role="tab"
              aria-selected={categoriaFiltro === 'todos'}
              className={`pilula-btn ${categoriaFiltro === 'todos' ? 'ativa' : ''}`}
              onClick={() => setCategoriaFiltro('todos')}
            >
              Todos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={categoriaFiltro === 'reuniao'}
              className={`pilula-btn ${categoriaFiltro === 'reuniao' ? 'ativa' : ''}`}
              onClick={() => setCategoriaFiltro('reuniao')}
            >
              Salas de Reunião
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={categoriaFiltro === 'coworking'}
              className={`pilula-btn ${categoriaFiltro === 'coworking' ? 'ativa' : ''}`}
              onClick={() => setCategoriaFiltro('coworking')}
            >
              Coworking
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={categoriaFiltro === 'auditorio'}
              className={`pilula-btn ${categoriaFiltro === 'auditorio' ? 'ativa' : ''}`}
              onClick={() => setCategoriaFiltro('auditorio')}
            >
              Auditório
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={categoriaFiltro === 'hub'}
              className={`pilula-btn ${categoriaFiltro === 'hub' ? 'ativa' : ''}`}
              onClick={() => setCategoriaFiltro('hub')}
            >
              Crea Tec HUB
            </button>
          </div>
        </div>

        {/* ============================================================
            4. GRADE LIMPA DE CARDS (Espaços e Equipamentos)
            ============================================================ */}
        <div className="grid-catalogo-minimalista">
          {/* Ambientes Físicos */}
          {ambientesFiltrados.map((espaco) => (
            <article key={espaco.id} className="card-minimalista">
              <div className="card-minimalista-topo">
                <span className="categoria-rotulo">
                  {espaco.tipo === 'coworking' && 'Coworking'}
                  {espaco.tipo === 'reuniao' && 'Sala Privativa'}
                  {espaco.tipo === 'auditorio' && 'Auditório'}
                </span>
                <span className="badge-disponibilidade disponivel">
                  ● Disponível
                </span>
              </div>

              <h3 className="card-minimalista-titulo">{espaco.nome}</h3>
              <p className="card-minimalista-desc">{espaco.descricao}</p>

              <div className="card-minimalista-tags">
                <span className="tag-neutra">Capacidade: {espaco.capacidade} pessoas</span>
                {espaco.recursos.slice(0, 2).map((rec, i) => (
                  <span key={i} className="tag-neutra">{rec}</span>
                ))}
              </div>

              <div className="card-minimalista-rodape">
                <span className="info-secundaria">{espaco.horarioFuncionamento}</span>
                <button
                  type="button"
                  className="btn btn-cta btn-sm"
                  onClick={() => navigate('/ambientes')}
                >
                  Reservar
                </button>
              </div>
            </article>
          ))}

          {/* Equipamentos Crea Tec HUB */}
          {equipamentosFiltrados.map((equip) => (
            <article key={equip.id} className="card-minimalista card-hub">
              <div className="card-minimalista-topo">
                <span className="categoria-rotulo tag-hub-label">Crea Tec HUB</span>
                <span className={`badge-disponibilidade ${equip.status === 'disponivel' ? 'disponivel' : 'ocupado'}`}>
                  {equip.status === 'disponivel' ? '● Em Prontidão' : '⏳ Em Campo'}
                </span>
              </div>

              <h3 className="card-minimalista-titulo">{equip.nome}</h3>
              <p className="card-minimalista-desc">{equip.descricao}</p>

              <div className="card-minimalista-tags">
                <span className="tag-neutra">{equip.categoria}</span>
                <span className="tag-neutra">Patrimônio: {equip.patrimonio}</span>
              </div>

              <div className="card-minimalista-rodape">
                <span className="info-secundaria">{equip.requisito}</span>
                <button
                  type="button"
                  className={`btn btn-sm ${equip.status === 'disponivel' ? 'btn-primario' : 'btn-secundario'}`}
                  disabled={equip.status !== 'disponivel'}
                  onClick={() => navigate('/equipamentos')}
                >
                  {equip.status === 'disponivel' ? 'Solicitar' : 'Ocupado'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============================================================
          5. RODAPÉ DE APOIO AO ASSOCIADO (Clean & Discreto)
          ============================================================ */}
      <footer className="dashboard-rodape-apoio">
        <div className="apoio-item">
          <strong>Regulamento de Uso</strong>
          <span>Cancelamentos com até 2h de antecedência pelo painel.</span>
        </div>
        <div className="apoio-divisor" />
        <div className="apoio-item">
          <strong>Crea Tec HUB</strong>
          <span>Retirada mediante assinatura de Termo de Responsabilidade.</span>
        </div>
        <div className="apoio-divisor" />
        <div className="apoio-item">
          <strong>Suporte Mútua-PI</strong>
          <span>(86) 3221-5055 • recepcao@mutua-pi.com.br</span>
        </div>
      </footer>
    </div>
  )
}
