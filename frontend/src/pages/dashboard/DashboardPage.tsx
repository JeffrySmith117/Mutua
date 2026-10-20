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

  // Espaços em destaque
  const espacosDestaque = [
    {
      id: 'coworking-1',
      nome: 'Espaço Coworking Compartilhado',
      tipo: 'coworking',
      capacidade: 24,
      descricao: 'Bancadas ergonômicas, internet Wi-Fi 6 de alta velocidade, café e água inclusos.',
      recursos: ['Wi-Fi 6', 'Climatizado', 'Tomadas Individuais', 'Café & Água'],
      disponivel: true,
      horarioFuncionamento: '08:00 às 18:00',
    },
    {
      id: 'sala-reuniao-a',
      nome: 'Sala de Reuniões Executiva A',
      tipo: 'sala_reuniao',
      capacidade: 8,
      descricao: 'Ambiente acústico privativo com tela 65" para apresentações e videoconferência.',
      recursos: ['Smart TV 4K', 'Videoconferência', 'Quadro Branco', 'Climatizado'],
      disponivel: true,
      horarioFuncionamento: 'Blocos de 1h a 4h',
    },
    {
      id: 'auditorio-principal',
      nome: 'Auditório Cláudio Portella',
      tipo: 'auditorio',
      capacidade: 60,
      descricao: 'Auditório equipado para palestras, seminários técnicos e reuniões magnas do CREA.',
      recursos: ['Projetor Laser', 'Sistema de Som', 'Microfones Sem Fio', 'Cabine Técnica'],
      disponivel: true,
      horarioFuncionamento: 'Turno matutino / vespertino',
    },
  ]

  // Equipamentos do Crea Tec HUB em destaque
  const equipamentosHub = [
    {
      id: 'eq-drone-phantom',
      nome: 'Drone DJI Phantom 4 RTK',
      categoria: 'Mapeamento e Topografia',
      patrimonio: 'HUB-0042',
      status: 'disponivel',
      descricao: 'Precisão centimétrica para aerofotogrametria e inspeções de engenharia.',
      requisito: 'Certificado ANAC / DECEA',
    },
    {
      id: 'eq-termografica-flir',
      nome: 'Câmera Termográfica FLIR E8-XT',
      categoria: 'Inspeção e Perícia Técnica',
      patrimonio: 'HUB-0019',
      status: 'disponivel',
      descricao: 'Diagnóstico de sobrecargas elétricas, isolamento térmico e infiltrações.',
      requisito: 'Termo de Responsabilidade',
    },
    {
      id: 'eq-estacao-total',
      nome: 'Estação Total Leica FlexLine TS07',
      categoria: 'Agrimensura e Georreferenciamento',
      patrimonio: 'HUB-0008',
      status: 'em_uso',
      descricao: 'Medição precisa de distâncias com compensador quadrupilar e display touch.',
      requisito: 'Devolução prevista: 23/10',
    },
  ]

  return (
    <div className="dashboard-wrapper">
      {/* ============================================================
          BANNER DE BOAS-VINDAS / HERO
          ============================================================ */}
      <section className="dashboard-hero">
        <div className="hero-conteudo">
          <div className="hero-tag">
            <span className="hero-tag-ponto" />
            <span>Mútua Piauí • Gestão Integrada de Espaços</span>
          </div>

          <h1 className="hero-titulo">
            Bem-vindo(a), <span className="destaque-nome">{primeiroNome}</span>! 👋
          </h1>

          <p className="hero-descricao">
            Agende salas privativas, estações no coworking e retire equipamentos de ponta do 
            <strong> Crea Tec HUB</strong> para apoiar seus projetos de engenharia e agronomia.
          </p>

          <div className="hero-acoes">
            <button
              type="button"
              className="btn btn-primario btn-hero"
              onClick={() => navigate('/ambientes')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <line x1="12" y1="10" x2="12" y2="14" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              <span>Reservar Espaço / Sala</span>
            </button>

            <button
              type="button"
              className="btn btn-outline-hero"
              onClick={() => navigate('/equipamentos')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Solicitar Equipamento HUB</span>
            </button>
          </div>
        </div>

        {/* Card informativo integrado no Hero */}
        <div className="hero-card-destaque">
          <div className="hero-card-topo">
            <span className="badge-beneficio">Benefício do Associado</span>
            <span className="badge-crea">CREA-PI</span>
          </div>
          <h3 className="hero-card-titulo">Crea Tec HUB Mútua-PI</h3>
          <p className="hero-card-texto">
            Você tem direito a <strong>40 horas mensais gratuitas</strong> no espaço coworking 
            e acesso por empréstimo a equipamentos tecnológicos homologados.
          </p>
          <div className="hero-card-stats">
            <div className="stat-miniatura">
              <span className="stat-num">14h</span>
              <span className="stat-rotulo">Utilizadas</span>
            </div>
            <div className="stat-divisor" />
            <div className="stat-miniatura">
              <span className="stat-num">26h</span>
              <span className="stat-rotulo">Disponíveis</span>
            </div>
            <div className="stat-divisor" />
            <div className="stat-miniatura">
              <span className="stat-num">100%</span>
              <span className="stat-rotulo">Regular</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CARDS DE INDICADORES RÁPIDOS (KPIs)
          ============================================================ */}
      <section className="metricas-grid">
        <div className="metrica-card">
          <div className="metrica-icone icone-azul">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="metrica-dados">
            <span className="metrica-valor">2</span>
            <span className="metrica-titulo">Reservas Ativas</span>
            <span className="metrica-detalhe">1 sala confirmada • 1 em análise</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icone icone-verde">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
            </svg>
          </div>
          <div className="metrica-dados">
            <span className="metrica-valor">3 / 4</span>
            <span className="metrica-titulo">Espaços Livres Hoje</span>
            <span className="metrica-detalhe">Coworking com vagas livres</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icone icone-ambar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="metrica-dados">
            <span className="metrica-valor">8 / 10</span>
            <span className="metrica-titulo">Equipamentos em Prontidão</span>
            <span className="metrica-detalhe">Drones e câmeras térmicas</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icone icone-roxo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metrica-dados">
            <span className="metrica-valor">Ativo</span>
            <span className="metrica-titulo">Status Cadastral</span>
            <span className="metrica-detalhe">Anuidade Mútua 2026 em dia</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          SEÇÃO: PRÓXIMAS RESERVAS DO ASSOCIADO
          ============================================================ */}
      <section className="secao-dashboard">
        <div className="secao-cabecalho">
          <div>
            <h2 className="secao-titulo">Minhas Próximas Reservas</h2>
            <p className="secao-subtitulo">Acompanhe horários confirmados e solicitações em andamento</p>
          </div>
          <Link to="/minhas-reservas" className="link-ver-todos">
            <span>Ver todas</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="reservas-grid">
          {reservas.map((item) => (
            <div key={item.id} className="reserva-card-horizontal">
              <div className="reserva-tipo-barra" data-tipo={item.tipo} />
              
              <div className="reserva-card-corpo">
                <div className="reserva-topo">
                  <div className="reserva-tag-categoria">
                    {item.tipo === 'ambiente' ? '🏢 Espaço Físico' : '🛰️ Equipamento HUB'}
                  </div>

                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'confirmada' && '● Confirmada'}
                    {item.status === 'pendente' && '⏳ Em Análise'}
                    {item.status === 'em_andamento' && '⚡ Em Andamento'}
                  </span>
                </div>

                <h3 className="reserva-item-titulo">{item.titulo}</h3>
                <p className="reserva-item-categoria">{item.categoria}</p>

                <div className="reserva-dados-grid">
                  <div className="reserva-dado-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{item.data}</span>
                  </div>

                  <div className="reserva-dado-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{item.horario}</span>
                  </div>

                  <div className="reserva-dado-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{item.localOuPatrimonio}</span>
                  </div>
                </div>

                <div className="reserva-rodape">
                  <span className="reserva-protocolo">Protocolo: <strong>{item.protocolo}</strong></span>

                  <div className="reserva-botoes">
                    <button
                      type="button"
                      className="btn-acao-secundaria"
                      onClick={() => alert(`Detalhes do protocolo ${item.protocolo}: Horário agendado com sucesso.`)}
                    >
                      Ver Detalhes
                    </button>
                    {item.status === 'confirmada' && (
                      <button
                        type="button"
                        className="btn-acao-primaria"
                        onClick={() => alert('Check-in disponível 15 minutos antes do início no local.')}
                      >
                        Check-in QR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SEÇÃO: ESPAÇOS E SALAS DISPONÍVEIS
          ============================================================ */}
      <section className="secao-dashboard">
        <div className="secao-cabecalho">
          <div>
            <h2 className="secao-titulo">Espaços e Salas Disponíveis</h2>
            <p className="secao-subtitulo">Estrutura premium na sede da Mútua-PI para reuniões e trabalho</p>
          </div>
          <Link to="/ambientes" className="link-ver-todos">
            <span>Explorar catálogo completo</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="catalogo-grid">
          {espacosDestaque.map((espaco) => (
            <div key={espaco.id} className="card-item-catalogo">
              <div className="card-item-imagem-wrapper">
                <div className={`tag-capacidade ${espaco.tipo === 'auditorio' ? 'tag-auditorio' : ''}`}>
                  👥 Até {espaco.capacidade} pessoas
                </div>
                <div className="banner-ambiente-placeholder" data-tipo={espaco.tipo}>
                  <div className="ambiente-icone-simbolo">
                    {espaco.tipo === 'coworking' && '💻'}
                    {espaco.tipo === 'sala_reuniao' && '🤝'}
                    {espaco.tipo === 'auditorio' && '🎙️'}
                  </div>
                  <span className="ambiente-tipo-rotulo">
                    {espaco.tipo === 'coworking' && 'Coworking Livre'}
                    {espaco.tipo === 'sala_reuniao' && 'Sala Privativa'}
                    {espaco.tipo === 'auditorio' && 'Auditório Master'}
                  </span>
                </div>
              </div>

              <div className="card-item-conteudo">
                <h3 className="card-item-titulo">{espaco.nome}</h3>
                <p className="card-item-descricao">{espaco.descricao}</p>

                <div className="card-tags-recursos">
                  {espaco.recursos.map((rec, i) => (
                    <span key={i} className="tag-recurso">
                      {rec}
                    </span>
                  ))}
                </div>

                <div className="card-item-rodape">
                  <span className="horario-info">⏰ {espaco.horarioFuncionamento}</span>
                  <button
                    type="button"
                    className="btn btn-primario btn-sm"
                    onClick={() => navigate('/ambientes')}
                  >
                    Agendar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SEÇÃO: EQUIPAMENTOS CREA TEC HUB
          ============================================================ */}
      <section className="secao-dashboard">
        <div className="secao-cabecalho">
          <div>
            <div className="tag-secao-hub">Inovação Mútua-PI</div>
            <h2 className="secao-titulo">Equipamentos do Crea Tec HUB</h2>
            <p className="secao-subtitulo">
              Aparelhos tecnológicos de alta precisão disponíveis para empréstimo institucional
            </p>
          </div>
          <Link to="/equipamentos" className="link-ver-todos">
            <span>Ver todos os equipamentos</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="catalogo-grid">
          {equipamentosHub.map((equip) => (
            <div key={equip.id} className="card-item-catalogo card-equipamento">
              <div className="card-item-imagem-wrapper">
                <span className={`badge-status-equip status-equip-${equip.status}`}>
                  {equip.status === 'disponivel' ? '● Disponível para Empréstimo' : '⏳ Em Campo'}
                </span>
                
                <div className="banner-ambiente-placeholder banner-hub-bg">
                  <div className="ambiente-icone-simbolo">
                    {equip.id.includes('drone') && '🛰️'}
                    {equip.id.includes('termografica') && '📷'}
                    {equip.id.includes('estacao') && '📐'}
                  </div>
                  <span className="ambiente-tipo-rotulo">{equip.patrimonio}</span>
                </div>
              </div>

              <div className="card-item-conteudo">
                <span className="categoria-rotulo-equip">{equip.categoria}</span>
                <h3 className="card-item-titulo">{equip.nome}</h3>
                <p className="card-item-descricao">{equip.descricao}</p>

                <div className="info-requisito-equip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>{equip.requisito}</span>
                </div>

                <div className="card-item-rodape">
                  <span className="patrimonio-tag">Patrimônio: {equip.patrimonio}</span>
                  <button
                    type="button"
                    className={`btn btn-sm ${equip.status === 'disponivel' ? 'btn-primario' : 'btn-desabilitado'}`}
                    disabled={equip.status !== 'disponivel'}
                    onClick={() => navigate('/equipamentos')}
                  >
                    {equip.status === 'disponivel' ? 'Solicitar' : 'Indisponível'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          CARD DE ORIENTAÇÕES E REGRAS INSTITUCIONAIS
          ============================================================ */}
      <section className="aviso-institucional-card">
        <div className="aviso-icone">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="aviso-conteudo">
          <h4 className="aviso-titulo">Orientações de Utilização dos Espaços & Equipamentos</h4>
          <p className="aviso-texto">
            • Cancelamentos de salas devem ser feitos com no mínimo <strong>2 horas de antecedência</strong> pelo painel.<br />
            • A retirada de equipamentos do Crea Tec HUB exige a assinatura do <strong>Termo de Responsabilidade</strong> no balcão de atendimento e conferência no ato da devolução.<br />
            • Dúvidas ou suporte emergencial? Procure a recepção da Mútua-PI ou ligue para <strong>(86) 3221-5055</strong>.
          </p>
        </div>
      </section>
    </div>
  )
}
