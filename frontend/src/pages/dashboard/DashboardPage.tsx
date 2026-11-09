import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
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
  const { tema, alternarTema } = useThemeStore()

  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Associado'

  // Reservas simuladas para o associado
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

  const proximaReserva = reservas.find((r) => r.status === 'confirmada' || r.status === 'pendente')

  return (
    <div className="editorial-page-container">
      {/* ============================================================
          1. HERO COM CORTE DIAGONAL ANGULAR (Estilo Fotografia Editorial)
          ============================================================ */}
      <section className="editorial-hero">
        <div className="editorial-hero-grid">
          {/* Coluna Esquerda: Espaço em Branco & Tipografia Expressiva */}
          <div className="hero-esquerda-conteudo">
            <div className="hero-top-meta">
              <span className="hero-tag-editorial">MÚTUA-PI • CREA TEC HUB — OLÁ, {primeiroNome.toUpperCase()}</span>
              <button
                type="button"
                className="hero-theme-toggle-inline"
                onClick={alternarTema}
                title="Alternar entre tema claro e escuro"
                aria-label="Alternar tema"
              >
                {tema === 'claro' ? '🌙 Modo Noturno' : '☀️ Modo Claro'}
              </button>
            </div>

            <h1 className="hero-titulo-editorial">
              Engenharia & Ambientes<br />
              <span className="hero-titulo-destaque">de Alta Precisão</span>
            </h1>

            <p className="hero-descricao-editorial">
              Plataforma unificada para associados do Sistema Confea/CREA-PI.
              Reserve salas executivas, estações no coworking e retire equipamentos tecnológicos homologados para seus projetos e laudos técnicos.
            </p>

            {/* Conjunto de Botões em Pílula (Pill Buttons) */}
            <div className="hero-botoes-pilula-grupo">
              <div className="hero-linha-pilulas-secundarias">
                <button
                  type="button"
                  className="btn-pilula btn-pilula-outline"
                  onClick={() => navigate('/ambientes')}
                  id="btn-pilula-ambientes"
                >
                  Ambientes Físicos
                </button>
                <button
                  type="button"
                  className="btn-pilula btn-pilula-outline"
                  onClick={() => navigate('/equipamentos')}
                  id="btn-pilula-equipamentos"
                >
                  Crea Tec HUB
                </button>
              </div>

              <button
                type="button"
                className="btn-pilula btn-pilula-dark hero-btn-primario"
                onClick={() => navigate('/ambientes')}
                id="btn-iniciar-agendamento"
              >
                <span>+ Iniciar Agendamento Imediato</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Coluna Direita: Imagem com Corte Angular / Diagonal Slice */}
          <div className="hero-direita-diagonal-wrapper">
            <div className="hero-diagonal-slice">
              <img
                src="/hero-hub.jpg"
                alt="Equipamentos de Engenharia de Precisão Crea Tec HUB Mútua-PI"
                className="hero-imagem-foco"
              />
              <div className="hero-diagonal-overlay" />
              <div className="hero-badge-diagonal">
                <span className="ponto-pulso-verde" />
                <span>Crea Tec HUB • Drone RTK & Estação Laser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BARRA COMPACTA: PRÓXIMO AGENDAMENTO ATIVO (Se houver)
          ============================================================ */}
      {proximaReserva && (
        <section className="editorial-reserva-aviso" aria-label="Reserva ativa">
          <div className="aviso-reserva-conteudo">
            <div className="aviso-reserva-esq">
              <span className="aviso-tag-status">● {proximaReserva.status.toUpperCase()}</span>
              <span className="aviso-titulo-item">{proximaReserva.titulo}</span>
              <span className="aviso-detalhes-item">
                {proximaReserva.data} • {proximaReserva.horario} • {proximaReserva.localOuPatrimonio}
              </span>
            </div>
            <div className="aviso-reserva-dir">
              <span className="aviso-protocolo">Protocolo: <code>{proximaReserva.protocolo}</code></span>
              <Link to="/minhas-reservas" className="btn-pilula btn-pilula-outline btn-pilula-sm">
                Ver Comprovante →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          2. SEÇÃO CENTRAL: 3 CARDS DE FOTOGRAFIA MONOCROMÁTICA
          ============================================================ */}
      <section className="editorial-secao-central">
        <div className="secao-label-central">
          <span>DESTAQUES EM ESTRUTURA & TECNOLOGIA</span>
        </div>

        <div className="editorial-cards-grid">
          {/* Card 1: Coworking */}
          <article className="editorial-card-foto" onClick={() => navigate('/ambientes')}>
            <div className="card-foto-wrapper">
              <img
                src="/card-coworking.jpg"
                alt="Espaço Coworking Mútua-PI"
                className="card-foto-img"
              />
              <div className="card-foto-tag">Coworking</div>
            </div>
            <div className="card-foto-info">
              <h3 className="card-foto-titulo">Espaço Coworking Compartilhado</h3>
              <p className="card-foto-desc">
                Bancadas ergonômicas, internet Wi-Fi 6 de alta performance e 40 horas mensais gratuitas para associados.
              </p>
              <span className="card-foto-link">Consultar vagas disponíveis →</span>
            </div>
          </article>

          {/* Card 2: Sala Executiva */}
          <article className="editorial-card-foto" onClick={() => navigate('/ambientes')}>
            <div className="card-foto-wrapper">
              <img
                src="/card-reuniao.jpg"
                alt="Sala de Reuniões Executiva"
                className="card-foto-img"
              />
              <div className="card-foto-tag">Sala Privativa</div>
            </div>
            <div className="card-foto-info">
              <h3 className="card-foto-titulo">Sala de Reuniões Executiva A</h3>
              <p className="card-foto-desc">
                Ambiente acústico privativo para até 8 pessoas com Smart TV 4K para apresentações e videoconferências.
              </p>
              <span className="card-foto-link">Reservar horário privativo →</span>
            </div>
          </article>

          {/* Card 3: Tecnologia HUB */}
          <article className="editorial-card-foto" onClick={() => navigate('/equipamentos')}>
            <div className="card-foto-wrapper">
              <img
                src="/card-termografica.jpg"
                alt="Câmera Termográfica FLIR E8-XT"
                className="card-foto-img"
              />
              <div className="card-foto-tag">Crea Tec HUB</div>
            </div>
            <div className="card-foto-info">
              <h3 className="card-foto-titulo">Câmera Termográfica FLIR E8-XT</h3>
              <p className="card-foto-desc">
                Diagnóstico de precisão em sobrecargas elétricas, isolamento térmico e laudos periciais de engenharia.
              </p>
              <span className="card-foto-link">Solicitar termo de empréstimo →</span>
            </div>
          </article>
        </div>
      </section>

      {/* ============================================================
          3. SEÇÃO INFERIOR: 3 COLUNAS COM DIVISORES & BOTÕES SÓLIDOS
          ============================================================ */}
      <section className="editorial-secao-colunas">
        <div className="editorial-coluna-bloco">
          <span className="coluna-categoria-tag">AMBIENTES FÍSICOS</span>
          <h2 className="coluna-titulo">Coworking & Salas</h2>
          <p className="coluna-texto">
            Espaços climatizados com controle acústico e suporte de recepção na sede de Teresina. Agende turnos de 1h até o dia todo.
          </p>
          <button
            type="button"
            className="btn-pilula btn-pilula-dark coluna-btn"
            onClick={() => navigate('/ambientes')}
          >
            Reservar Espaço
          </button>
        </div>

        <div className="coluna-divisor-vertical" />

        <div className="editorial-coluna-bloco">
          <span className="coluna-categoria-tag">CREA TEC HUB</span>
          <h2 className="coluna-titulo">Equipamentos Técnicos</h2>
          <p className="coluna-texto">
            Drones RTK, medidores de precisão e câmeras térmicas disponíveis por empréstimo para associados em dia com anuidade.
          </p>
          <button
            type="button"
            className="btn-pilula btn-pilula-dark coluna-btn"
            onClick={() => navigate('/equipamentos')}
          >
            Solicitar Equipamento
          </button>
        </div>

        <div className="coluna-divisor-vertical" />

        <div className="editorial-coluna-bloco">
          <span className="coluna-categoria-tag">CENTRAL DO ASSOCIADO</span>
          <h2 className="coluna-titulo">Minhas Reservas</h2>
          <p className="coluna-texto">
            Consulte horários confirmados, emita comprovantes com QR Code para check-in e assine os termos de responsabilidade digitalmente.
          </p>
          <button
            type="button"
            className="btn-pilula btn-pilula-dark coluna-btn"
            onClick={() => navigate('/minhas-reservas')}
          >
            Ver Minhas Reservas
          </button>
        </div>
      </section>

      {/* ============================================================
          4. BARRA DE RODAPÉ MINIMALISTA (Dock Monocromático)
          ============================================================ */}
      <footer className="editorial-dock-rodape">
        <div className="dock-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>40h Mensais Inclusas no Coworking</span>
        </div>

        <div className="dock-divisor-ponto">•</div>

        <div className="dock-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>Equipamentos Homologados Confea/CREA</span>
        </div>

        <div className="dock-divisor-ponto">•</div>

        <div className="dock-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Suporte Técnico: (86) 3221-5055</span>
        </div>

        <div className="dock-divisor-ponto">•</div>

        <div className="dock-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Sede Mútua-PI • Teresina-PI</span>
        </div>
      </footer>
    </div>
  )
}
