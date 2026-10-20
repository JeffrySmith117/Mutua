import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservaService, type ItemReservaCompleto } from '../../services/reservaService'
import { useAuthStore } from '../../store/authStore'
import './MinhasReservas.css'

export default function MinhasReservasPage() {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()

  const [reservas, setReservas] = useState<ItemReservaCompleto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [abaStatus, setAbaStatus] = useState<string>('todas')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [termoBusca, setTermoBusca] = useState('')

  // Modais
  const [reservaSelecionadaComprovante, setReservaSelecionadaComprovante] =
    useState<ItemReservaCompleto | null>(null)
  const [reservaParaCancelar, setReservaParaCancelar] =
    useState<ItemReservaCompleto | null>(null)
  const [reservaParaCheckin, setReservaParaCheckin] =
    useState<ItemReservaCompleto | null>(null)
  const [checkinConcluido, setCheckinConcluido] = useState(false)

  // Carregar reservas
  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const dados = await reservaService.listar()
        setReservas(dados)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  // Filtragem
  const reservasFiltradas = useMemo(() => {
    return reservas.filter((item) => {
      // Filtro de Aba / Status
      if (abaStatus === 'ativas' && item.status !== 'confirmada') return false
      if (abaStatus === 'pendentes' && item.status !== 'pendente') return false
      if (abaStatus === 'concluidas' && item.status !== 'concluida') return false
      if (abaStatus === 'canceladas' && item.status !== 'cancelada') return false

      // Filtro de Tipo
      if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false

      // Busca por texto
      if (termoBusca.trim()) {
        const termo = termoBusca.toLowerCase()
        const bateuTitulo = item.titulo.toLowerCase().includes(termo)
        const bateuProtocolo = item.protocolo.toLowerCase().includes(termo)
        const bateuLocal = item.localOuPatrimonio.toLowerCase().includes(termo)
        const bateuFinalidade = item.finalidade.toLowerCase().includes(termo)
        if (!bateuTitulo && !bateuProtocolo && !bateuLocal && !bateuFinalidade) return false
      }

      return true
    })
  }, [reservas, abaStatus, filtroTipo, termoBusca])

  // Ações
  const handleConfirmarCancelamento = async () => {
    if (!reservaParaCancelar) return

    await reservaService.cancelar(reservaParaCancelar.id)

    setReservas((prev) =>
      prev.map((r) =>
        r.id === reservaParaCancelar.id
          ? { ...r, status: 'cancelada', permitirCancelamento: false, permitirCheckin: false }
          : r
      )
    )

    setReservaParaCancelar(null)
  }

  const handleExecutarCheckin = async () => {
    if (!reservaParaCheckin) return

    await reservaService.realizarCheckin(reservaParaCheckin.id)
    setCheckinConcluido(true)

    setReservas((prev) =>
      prev.map((r) =>
        r.id === reservaParaCheckin.id ? { ...r, permitirCheckin: false } : r
      )
    )

    setTimeout(() => {
      setCheckinConcluido(false)
      setReservaParaCheckin(null)
    }, 1800)
  }

  // Formatadores
  const formatarData = (dataIso: string) => {
    try {
      const data = new Date(dataIso)
      return data.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dataIso
    }
  }

  const formatarHora = (dataIso: string) => {
    try {
      const data = new Date(dataIso)
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="minhas-reservas-container">
      {/* ============================================================
          CABEÇALHO DA CENTRAL DE RESERVAS
          ============================================================ */}
      <header className="reservas-cabecalho">
        <div>
          <div className="badge-modulo-reservas">
            <span className="ponto-status-reservas" />
            <span>Gestão Integrada • Espaços & HUB</span>
          </div>
          <h1 className="reservas-titulo">Minhas Reservas e Solicitações</h1>
          <p className="reservas-subtitulo">
            Acompanhe o status dos seus agendamentos de salas de reuniões, coworking e empréstimos
            do Crea Tec HUB.
          </p>
        </div>

        <div className="reservas-acoes-rapidas">
          <button
            type="button"
            className="btn btn-primario"
            onClick={() => navigate('/ambientes')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="10" x2="12" y2="14" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            <span>Reservar Sala</span>
          </button>

          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => navigate('/equipamentos')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Solicitar Equipamento</span>
          </button>
        </div>
      </header>

      {/* ============================================================
          ABAS DE STATUS E FILTROS
          ============================================================ */}
      <section className="painel-filtros-reservas">
        {/* Abas Superiores de Status */}
        <div className="abas-status-grupo">
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'todas' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaStatus('todas')}
          >
            Todas ({reservas.length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'ativas' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaStatus('ativas')}
          >
            ● Confirmadas / Ativas ({reservas.filter((r) => r.status === 'confirmada').length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'pendentes' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaStatus('pendentes')}
          >
            ⏳ Em Análise ({reservas.filter((r) => r.status === 'pendente').length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'concluidas' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaStatus('concluidas')}
          >
            ✓ Concluídas ({reservas.filter((r) => r.status === 'concluida').length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'canceladas' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaStatus('canceladas')}
          >
            Canceladas ({reservas.filter((r) => r.status === 'cancelada').length})
          </button>
        </div>

        {/* Linha de Busca e Tipo */}
        <div className="linha-busca-tipo-reservas">
          <div className="busca-reservas-box">
            <span className="icone-lupa-reservas">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por protocolo, nome do espaço, equipamento ou patrimônio..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="input-busca-reservas"
            />
          </div>

          <div className="pilulas-tipo-reservas">
            <button
              type="button"
              className={`pilula-tipo-btn ${filtroTipo === 'todos' ? 'pilula-tipo-ativa' : ''}`}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos os Tipos
            </button>
            <button
              type="button"
              className={`pilula-tipo-btn ${filtroTipo === 'ambiente' ? 'pilula-tipo-ativa' : ''}`}
              onClick={() => setFiltroTipo('ambiente')}
            >
              🏢 Salas & Espaços
            </button>
            <button
              type="button"
              className={`pilula-tipo-btn ${filtroTipo === 'equipamento' ? 'pilula-tipo-ativa' : ''}`}
              onClick={() => setFiltroTipo('equipamento')}
            >
              🛰️ Equipamentos HUB
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          LISTA DE RESERVAS
          ============================================================ */}
      <section className="lista-reservas-bloco">
        {carregando ? (
          <div className="carregando-reservas-bloco">
            <div className="spinner-carregando" />
            <p>Carregando histórico de reservas...</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="empty-state-reservas">
            <span className="empty-icone-reservas">📋</span>
            <h3 className="empty-titulo-reservas">Nenhuma reserva encontrada</h3>
            <p className="empty-desc-reservas">
              Você não possui reservas com os filtros selecionados. Agende uma sala de reuniões ou
              solicite um equipamento tecnológico para começar.
            </p>
            <div className="empty-botoes-reservas">
              <button
                type="button"
                className="btn btn-primario"
                onClick={() => navigate('/ambientes')}
              >
                Explorar Espaços Disponíveis
              </button>
              <button
                type="button"
                className="btn btn-secundario"
                onClick={() => navigate('/equipamentos')}
              >
                Explorar Equipamentos HUB
              </button>
            </div>
          </div>
        ) : (
          <div className="grade-cards-reservas">
            {reservasFiltradas.map((reserva) => (
              <div key={reserva.id} className="card-reserva-associado">
                <div
                  className={`faixa-lateral-tipo ${
                    reserva.tipo === 'ambiente' ? 'faixa-ambiente' : 'faixa-equipamento'
                  }`}
                />

                <div className="card-reserva-conteudo">
                  {/* Topo com Categoria e Status */}
                  <div className="reserva-card-cabecalho">
                    <div className="reserva-tipo-identificador">
                      <span className="icone-tipo-pequeno">
                        {reserva.tipo === 'ambiente' ? '🏢 Espaço Físico' : '🛰️ Equipamento HUB'}
                      </span>
                      <span className="divisor-ponto">•</span>
                      <span className="protocolo-badge">{reserva.protocolo}</span>
                    </div>

                    <span className={`badge-status-reserva status-reserva-${reserva.status}`}>
                      {reserva.status === 'confirmada' && '● Confirmada'}
                      {reserva.status === 'pendente' && '⏳ Em Análise'}
                      {reserva.status === 'concluida' && '✓ Concluída'}
                      {reserva.status === 'cancelada' && '✕ Cancelada'}
                    </span>
                  </div>

                  {/* Título e Subtítulo */}
                  <h3 className="reserva-card-titulo">{reserva.titulo}</h3>
                  <p className="reserva-card-subtitulo">{reserva.subtitulo}</p>

                  {/* Dados de Horário e Local */}
                  <div className="reserva-dados-grid-box">
                    <div className="dado-linha">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>
                        <strong>Data:</strong> {formatarData(reserva.dataInicio)}
                      </span>
                    </div>

                    <div className="dado-linha">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        <strong>Horário:</strong> {formatarHora(reserva.dataInicio)} às{' '}
                        {formatarHora(reserva.dataFim)}
                      </span>
                    </div>

                    <div className="dado-linha">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{reserva.localOuPatrimonio}</span>
                    </div>
                  </div>

                  {/* Finalidade do Uso */}
                  <div className="finalidade-reserva-caixa">
                    <span className="finalidade-rotulo">Finalidade do Agendamento:</span>
                    <p className="finalidade-texto">{reserva.finalidade}</p>
                  </div>

                  {/* Rodapé com Ações */}
                  <div className="card-reserva-rodape-acoes">
                    <button
                      type="button"
                      className="btn-acao-outline"
                      onClick={() => setReservaSelecionadaComprovante(reserva)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span>Comprovante / PDF</span>
                    </button>

                    {reserva.permitirCheckin && (
                      <button
                        type="button"
                        className="btn-acao-destaque"
                        onClick={() => setReservaParaCheckin(reserva)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Check-in Presencial</span>
                      </button>
                    )}

                    {reserva.permitirCancelamento && (
                      <button
                        type="button"
                        className="btn-acao-perigo"
                        onClick={() => setReservaParaCancelar(reserva)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          MODAL DE COMPROVANTE OFICIAL DA MÚTUA-PI
          ============================================================ */}
      {reservaSelecionadaComprovante && (
        <div
          className="modal-comprovante-overlay"
          onClick={() => setReservaSelecionadaComprovante(null)}
        >
          <div
            className="modal-comprovante-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="comprovante-papel-timbrado">
              {/* Cabeçalho do Comprovante */}
              <div className="comprovante-topo">
                <div className="comprovante-logo-marca">
                  <span className="marca-principal">Mútua Piauí</span>
                  <span className="marca-sub">Caixa de Assistência dos Profissionais do CREA</span>
                </div>
                <div className="comprovante-protocolo-bloco">
                  <span className="comprovante-protocolo-rotulo">PROTOCOLO OFICIAL</span>
                  <strong className="comprovante-protocolo-numero">
                    {reservaSelecionadaComprovante.protocolo}
                  </strong>
                </div>
              </div>

              <div className="comprovante-divisor" />

              <h2 className="comprovante-titulo-documento">
                COMPROVANTE DE AGENDAMENTO DE{' '}
                {reservaSelecionadaComprovante.tipo === 'ambiente'
                  ? 'ESPAÇO FÍSICO'
                  : 'EQUIPAMENTO TECNOLÓGICO'}
              </h2>

              {/* Dados do Associado */}
              <div className="comprovante-secao">
                <h4 className="secao-comprovante-titulo">1. DADOS DO BENEFICIÁRIO ASSOCIADO</h4>
                <div className="grade-dados-comprovante">
                  <div>
                    <span className="rotulo-dado">Nome do Profissional:</span>
                    <strong>{usuario?.nome || 'Elias Pio Mendes'}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">Registro CREA-PI:</span>
                    <strong>{usuario?.registroCrea || 'CREA-PI 32415/D'}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">CPF:</span>
                    <strong>{usuario?.cpf || '123.456.789-00'}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">E-mail Cadastrado:</span>
                    <strong>{usuario?.email || 'elias.mendes@creapi.org.br'}</strong>
                  </div>
                </div>
              </div>

              {/* Dados da Reserva */}
              <div className="comprovante-secao">
                <h4 className="secao-comprovante-titulo">2. ESPECIFICAÇÃO DO AGENDAMENTO</h4>
                <div className="grade-dados-comprovante">
                  <div className="coluna-cheia">
                    <span className="rotulo-dado">Item Reservado:</span>
                    <strong className="destaque-item-nome">
                      {reservaSelecionadaComprovante.titulo}
                    </strong>
                  </div>
                  <div className="coluna-cheia">
                    <span className="rotulo-dado">Localização / Patrimônio:</span>
                    <span>{reservaSelecionadaComprovante.localOuPatrimonio}</span>
                  </div>
                  <div>
                    <span className="rotulo-dado">Data de Início:</span>
                    <strong>{formatarData(reservaSelecionadaComprovante.dataInicio)}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">Horário Reservado:</span>
                    <strong>
                      {formatarHora(reservaSelecionadaComprovante.dataInicio)} às{' '}
                      {formatarHora(reservaSelecionadaComprovante.dataFim)}
                    </strong>
                  </div>
                  <div className="coluna-cheia">
                    <span className="rotulo-dado">Finalidade Registrada:</span>
                    <span>{reservaSelecionadaComprovante.finalidade}</span>
                  </div>
                </div>
              </div>

              {/* Autenticidade Digital */}
              <div className="comprovante-autenticidade">
                <div className="codigo-autenticidade">
                  <span>Código de Autenticação Digital:</span>
                  <code>
                    MUT-AUTH-
                    {btoa(reservaSelecionadaComprovante.protocolo + '-MUTUAPI').substring(0, 18)}
                  </code>
                </div>
                <div className="aviso-apresentacao">
                  Apresente este comprovante impresso ou digital na recepção da Mútua-PI para liberação
                  de acesso ou retirada do equipamento.
                </div>
              </div>
            </div>

            {/* Ações do Comprovante */}
            <div className="comprovante-botoes-rodape">
              <button
                type="button"
                className="btn btn-secundario"
                onClick={() => setReservaSelecionadaComprovante(null)}
              >
                Fechar
              </button>
              <button
                type="button"
                className="btn btn-primario"
                onClick={() => window.print()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Imprimir Comprovante</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE CONFIRMAÇÃO DE CANCELAMENTO
          ============================================================ */}
      {reservaParaCancelar && (
        <div className="modal-perigo-overlay" onClick={() => setReservaParaCancelar(null)}>
          <div
            className="modal-perigo-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="perigo-icone-circulo">⚠️</div>
            <h3 className="perigo-titulo">Deseja cancelar esta reserva?</h3>
            <p className="perigo-descricao">
              Ao cancelar a reserva de <strong>{reservaParaCancelar.titulo}</strong> (Protocolo{' '}
              {reservaParaCancelar.protocolo}), o horário será disponibilizado imediatamente para outros
              profissionais associados.
            </p>

            <div className="perigo-acoes-botoes">
              <button
                type="button"
                className="btn btn-secundario"
                onClick={() => setReservaParaCancelar(null)}
              >
                Voltar e Manter
              </button>
              <button
                type="button"
                className="btn btn-confirmar-cancelamento"
                onClick={handleConfirmarCancelamento}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE CHECK-IN PRESENCIAL
          ============================================================ */}
      {reservaParaCheckin && (
        <div className="modal-checkin-overlay" onClick={() => setReservaParaCheckin(null)}>
          <div
            className="modal-checkin-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {checkinConcluido ? (
              <div className="checkin-sucesso-bloco">
                <div className="icone-checkin-sucesso">✓</div>
                <h3 className="checkin-sucesso-titulo">Check-in Realizado com Sucesso!</h3>
                <p className="checkin-sucesso-desc">
                  Sua presença foi confirmada e a chave/acesso ao espaço já está liberada na recepção.
                </p>
              </div>
            ) : (
              <div className="checkin-formulario-bloco">
                <div className="checkin-icone-topo">📍</div>
                <h3 className="checkin-titulo">Validação de Check-in Presencial</h3>
                <p className="checkin-descricao">
                  Confirme sua presença no local para a reserva do espaço{' '}
                  <strong>{reservaParaCheckin.titulo}</strong> na sede da Mútua-PI.
                </p>

                <div className="checkin-card-instrucao">
                  <span>Sede Mútua-PI • Teresina</span>
                  <strong>Recepção Central • 2º Andar</strong>
                </div>

                <div className="checkin-acoes-botoes">
                  <button
                    type="button"
                    className="btn btn-secundario"
                    onClick={() => setReservaParaCheckin(null)}
                  >
                    Agora Não
                  </button>
                  <button
                    type="button"
                    className="btn btn-primario"
                    onClick={handleExecutarCheckin}
                  >
                    Confirmar Minha Presença
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
