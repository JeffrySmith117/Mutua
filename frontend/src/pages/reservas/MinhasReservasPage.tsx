import { corresponde } from '../../utils/corresponde'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { consultarReservas, statusReserva } from '../../services/consultas'
import Janela from '../../components/Janela'
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { reservaService, type ItemReservaCompleto } from '../../services/reservaService'
import { useAuthStore } from '../../store/authStore'
import { extrairMensagemErro } from '../../utils/erroApi'
import './MinhasReservas.css'

export default function MinhasReservasPage() {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()

  const [parametros, setParametros] = useSearchParams()
  const id = parametros.get('id')
  const queryClient = useQueryClient()
  const opcoes = consultarReservas(usuario?.id ?? '')
  const consulta = useQuery({ ...opcoes, staleTime: 0 })
  const reservas = consulta.data
  const [agora] = useState(Date.now)
  const atualizarReservas = () => {
    void queryClient.invalidateQueries({ queryKey: opcoes.queryKey })
    void queryClient.invalidateQueries({ queryKey: ['disponibilidade'] })
    void queryClient.invalidateQueries({ queryKey: ['equipamentos'] })
  }
  const [abaStatus, setAbaStatus] = useState<string>('todas')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [termoBusca, setTermoBusca] = useState('')
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [processandoAcao, setProcessandoAcao] = useState(false)

  // Modais
  const [reservaSelecionadaComprovante, setReservaSelecionadaComprovante] =
    useState<ItemReservaCompleto | null>(null)
  const [reservaParaCancelar, setReservaParaCancelar] =
    useState<ItemReservaCompleto | null>(null)
  const [reservaParaCheckin, setReservaParaCheckin] =
    useState<ItemReservaCompleto | null>(null)
  const [checkinConcluido, setCheckinConcluido] = useState(false)

  // Filtragem
  const reservasFiltradas = useMemo(() => {
    const prioridade = (item: ItemReservaCompleto) => {
      if (item.status === 'pendente' || item.status === 'em_uso') return 0
      return item.status === 'confirmada' && Date.parse(item.dataFim) >= agora ? 1 : 2
    }
    return (reservas ?? []).filter((item) => {
      if (id) return item.id === id
      // Filtro de Aba / Status
      if (abaStatus === 'ativas' && item.status !== 'confirmada' && item.status !== 'em_uso') return false
      if (abaStatus === 'pendentes' && item.status !== 'pendente') return false
      if (abaStatus === 'concluidas' && item.status !== 'concluida') return false
      if (
        abaStatus === 'canceladas' &&
        item.status !== 'cancelada' &&
        item.status !== 'recusada' &&
        item.status !== 'nao_compareceu'
      ) {
        return false
      }

      // Filtro de Tipo
      if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false

      return corresponde(termoBusca, item.titulo, item.protocolo, item.localOuPatrimonio, item.finalidade)
    }).sort((a, b) => {
      const ordem = prioridade(a) - prioridade(b)
      return ordem || (prioridade(a) < 2 ? a.dataInicio.localeCompare(b.dataInicio) : b.dataInicio.localeCompare(a.dataInicio))
    })
  }, [reservas, abaStatus, filtroTipo, termoBusca, id, agora])

  // Ações
  const handleConfirmarCancelamento = async () => {
    if (!reservaParaCancelar || processandoAcao) return
    setProcessandoAcao(true)
    setErroAcao(null)

    try {
      await reservaService.cancelar(reservaParaCancelar.id)
      atualizarReservas()
      setReservaParaCancelar(null)
    } catch (err) {
      setErroAcao(extrairMensagemErro(err))
    } finally {
      setProcessandoAcao(false)
    }
  }

  const handleExecutarCheckin = async () => {
    if (!reservaParaCheckin || processandoAcao) return
    setProcessandoAcao(true)
    setErroAcao(null)

    try {
      await reservaService.realizarCheckin(reservaParaCheckin.id)
      setCheckinConcluido(true)

      atualizarReservas()
    } catch (err) {
      setErroAcao(extrairMensagemErro(err))
    } finally {
      setProcessandoAcao(false)
    }
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
      {/* Banner de erro geral da página */}
      {erroAcao && (
        <div className="banner-erro-reservas" role="alert" style={{
          background: 'var(--error-bg)',
          border: '1px solid var(--line-hover)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--error)'
        }}>
          <div>
            <strong>Atenção:</strong> {erroAcao}
          </div>
          <button
            type="button"
            onClick={() => setErroAcao(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--error)',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================
          CABEÇALHO DA CENTRAL DE RESERVAS
          ============================================================ */}
      <header className="titulo-pagina">
        <h1>Minhas reservas</h1>
        <p>Acompanhe suas reservas de ambientes e solicitações de equipamentos.</p>
      </header>

      {/* ============================================================
          ABAS DE STATUS E FILTROS
          ============================================================ */}
      {id && <p className="reserva-selecionada">
        <button type="button" className="btn btn-secundario" onClick={() => setParametros({}, { replace: true })}>Ver todas as reservas</button>
      </p>}
      {!id && <section className="painel-filtros-reservas" aria-label="Filtros de reservas">
        {/* Abas Superiores de Status */}
        <div className="abas-status-grupo">
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'todas' ? 'aba-ativa' : ''}`}
            aria-pressed={abaStatus === 'todas'}
            onClick={() => setAbaStatus('todas')}
          >
            Todas ({reservas?.length ?? 0})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'ativas' ? 'aba-ativa' : ''}`}
            aria-pressed={abaStatus === 'ativas'}
            onClick={() => setAbaStatus('ativas')}
          >
            Confirmadas / Em Uso ({(reservas ?? []).filter((r) => r.status === 'confirmada' || r.status === 'em_uso').length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'pendentes' ? 'aba-ativa' : ''}`}
            aria-pressed={abaStatus === 'pendentes'}
            onClick={() => setAbaStatus('pendentes')}
          >
            Em Análise ({(reservas ?? []).filter((r) => r.status === 'pendente').length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'concluidas' ? 'aba-ativa' : ''}`}
            aria-pressed={abaStatus === 'concluidas'}
            onClick={() => setAbaStatus('concluidas')}
          >
            Concluídas ({(reservas ?? []).filter((r) => r.status === 'concluida').length})
          </button>
          <button
            type="button"
            className={`aba-status-btn ${abaStatus === 'canceladas' ? 'aba-ativa' : ''}`}
            aria-pressed={abaStatus === 'canceladas'}
            onClick={() => setAbaStatus('canceladas')}
          >
            Canceladas / Recusadas ({(reservas ?? []).filter((r) => r.status === 'cancelada' || r.status === 'recusada' || r.status === 'nao_compareceu').length})
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
              type="search"
              aria-label="Buscar nas minhas reservas"
              placeholder="Protocolo, nome ou patrimônio"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="input-busca-reservas"
            />
          </div>

          <div className="pilulas-tipo-reservas">
            <button
              type="button"
              className={`pilula-tipo-btn ${filtroTipo === 'todos' ? 'pilula-tipo-ativa' : ''}`}
              aria-pressed={filtroTipo === 'todos'}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos os Tipos
            </button>
            <button
              type="button"
              className={`pilula-tipo-btn ${filtroTipo === 'ambiente' ? 'pilula-tipo-ativa' : ''}`}
              aria-pressed={filtroTipo === 'ambiente'}
              onClick={() => setFiltroTipo('ambiente')}
            >
              🏢 Salas & Espaços
            </button>
            <button
              type="button"
              className={`pilula-tipo-btn ${filtroTipo === 'equipamento' ? 'pilula-tipo-ativa' : ''}`}
              aria-pressed={filtroTipo === 'equipamento'}
              onClick={() => setFiltroTipo('equipamento')}
            >
              🛰️ Equipamentos HUB
            </button>
          </div>
        </div>
      </section>}

      {/* ============================================================
          LISTA DE RESERVAS
          ============================================================ */}
      <section className="lista-reservas-bloco">
        {consulta.isError ? <div className="bloco-sigra" role="alert">
          <p>Não foi possível carregar suas reservas.</p>
          <button className="btn btn-secundario" type="button" onClick={() => void consulta.refetch()}>Tentar novamente</button>
        </div> : consulta.isPending ? (
          <div className="carregando-reservas-bloco" role="status">
            <div className="spinner-carregando" />
            <p>Carregando histórico de reservas...</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="empty-state-reservas">
            <h3 className="empty-titulo-reservas">Nenhuma reserva encontrada</h3>
            <p className="empty-desc-reservas">
              {id ? 'O registro selecionado não está disponível na sua lista.' :
                reservas?.length ? 'Ajuste os filtros para encontrar outros registros.' :
                  'Reserve um ambiente ou solicite um equipamento para começar.'}
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
                      {reserva.status === 'em_uso' && '▶ Em Uso'}
                      {reserva.status === 'pendente' && 'Em Análise'}
                      {reserva.status === 'concluida' && '✓ Concluída'}
                      {reserva.status === 'cancelada' && '✕ Cancelada'}
                      {reserva.status === 'recusada' && '✕ Recusada'}
                      {reserva.status === 'nao_compareceu' && '⚠ Não Compareceu'}
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
                        {reserva.dataInicio.slice(0, 10) !== reserva.dataFim.slice(0, 10) && ` até ${formatarData(reserva.dataFim)}`}
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

                  {/* Motivo de Recusa ou Cancelamento se houver */}
                  {reserva.motivoCancelamentoOuRecusa && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.625rem 0.875rem',
                      background: 'var(--error-bg)',
                      border: '1px solid var(--line-hover)',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: 'var(--error)'
                    }}>
                      <strong>Motivo informado:</strong> {reserva.motivoCancelamentoOuRecusa}
                    </div>
                  )}

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
                        disabled={processandoAcao}
                        onClick={() => {
                          setErroAcao(null)
                          setReservaParaCheckin(reserva)
                        }}
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
                        disabled={processandoAcao}
                        onClick={() => {
                          setErroAcao(null)
                          setReservaParaCancelar(reserva)
                        }}
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
        <Janela className="modal-comprovante-container" fechar={() => { setReservaSelecionadaComprovante(null) }} titulo="Comprovante da reserva">
            <div className="comprovante-papel-timbrado">
              {/* Cabeçalho do Comprovante */}
              <div className="comprovante-topo">
                <div className="comprovante-logo-marca">
                  <span className="marca-principal">Mútua Piauí</span>
                  <span className="marca-sub">Caixa de Assistência dos Profissionais do CREA</span>
                </div>
                <div className="comprovante-protocolo-bloco">
                  <span className="comprovante-protocolo-rotulo">PROTOCOLO</span>
                  <strong className="comprovante-protocolo-numero">
                    {reservaSelecionadaComprovante.protocolo}
                  </strong>
                </div>
              </div>

              <div className="comprovante-divisor" />

              <h2 className="comprovante-titulo-documento">
                REGISTRO DE SOLICITAÇÃO DE{' '}
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
                    <strong>{usuario?.nome || 'Associado Mútua-PI'}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">Registro CREA-PI:</span>
                    <strong>{usuario?.registroCrea || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">CPF:</span>
                    <strong>{usuario?.cpf || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">E-mail Cadastrado:</span>
                    <strong>{usuario?.email || 'Não informado'}</strong>
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
                    <span className="rotulo-dado">Data de término:</span>
                    <strong>{formatarData(reservaSelecionadaComprovante.dataFim)}</strong>
                  </div>
                  <div>
                    <span className="rotulo-dado">Horário:</span>
                    <strong>
                      {formatarHora(reservaSelecionadaComprovante.dataInicio)} às{' '}
                      {formatarHora(reservaSelecionadaComprovante.dataFim)}
                    </strong>
                  </div>
                  <div className="coluna-cheia">
                    <span className="rotulo-dado">Finalidade Registrada:</span>
                    <span>{reservaSelecionadaComprovante.finalidade}</span>
                  </div>
                  <div>
                    <span className="rotulo-dado">Status:</span>
                    <strong>{statusReserva[reservaSelecionadaComprovante.status]}</strong>
                  </div>
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
        </Janela>
      )}

      {/* ============================================================
          MODAL DE CONFIRMAÇÃO DE CANCELAMENTO
          ============================================================ */}
      {reservaParaCancelar && (
        <Janela className="modal-perigo-container" fechar={() => { if (!processandoAcao) setReservaParaCancelar(null) }} titulo="Cancelar reserva">
            <div className="perigo-icone-circulo">⚠️</div>
            <h3 className="perigo-titulo">Deseja cancelar esta reserva?</h3>
            <p className="perigo-descricao">
              Ao cancelar a reserva de <strong>{reservaParaCancelar.titulo}</strong> (Protocolo{' '}
              {reservaParaCancelar.protocolo}), o horário será disponibilizado imediatamente para outros
              profissionais associados.
            </p>

            {erroAcao && (
              <div style={{
                margin: '1rem 0',
                padding: '0.75rem',
                background: 'var(--error-bg)',
                border: '1px solid var(--line-hover)',
                borderRadius: '8px',
                color: 'var(--error)',
                fontSize: '0.875rem'
              }}>
                {erroAcao}
              </div>
            )}

            <div className="perigo-acoes-botoes">
              <button
                type="button"
                className="btn btn-secundario"
                disabled={processandoAcao}
                onClick={() => setReservaParaCancelar(null)}
              >
                Voltar e Manter
              </button>
              <button
                type="button"
                className="btn btn-confirmar-cancelamento"
                disabled={processandoAcao}
                onClick={handleConfirmarCancelamento}
              >
                {processandoAcao ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
        </Janela>
      )}

      {/* ============================================================
          MODAL DE CHECK-IN PRESENCIAL
          ============================================================ */}
      {reservaParaCheckin && (
        <Janela className="modal-checkin-container" fechar={() => { if (!processandoAcao) { setCheckinConcluido(false); setReservaParaCheckin(null) } }} titulo="Check-in da reserva">
            {checkinConcluido ? (
              <div className="checkin-sucesso-bloco">
                <div className="icone-checkin-sucesso">✓</div>
                <h3 className="checkin-sucesso-titulo">Check-in Realizado com Sucesso!</h3>
                <p className="checkin-sucesso-desc" role="status">
                  Sua presença foi confirmada e a chave/acesso ao espaço já está liberada na recepção.
                </p>
                <button type="button" className="btn btn-primario" onClick={() => {
                  setCheckinConcluido(false)
                  setReservaParaCheckin(null)
                }}>Concluir</button>
              </div>
            ) : (
              <div className="checkin-formulario-bloco">
                <div className="checkin-icone-topo">📍</div>
                <h3 className="checkin-titulo">Validação de Check-in Presencial</h3>
                <p className="checkin-descricao">
                  Confirme sua presença no local para a reserva do espaço{' '}
                  <strong>{reservaParaCheckin.titulo}</strong> na sede da Mútua-PI.
                </p>

                {erroAcao && (
                  <div style={{
                    margin: '1rem 0',
                    padding: '0.75rem',
                    background: 'var(--error-bg)',
                    border: '1px solid var(--line-hover)',
                    borderRadius: '8px',
                    color: 'var(--error)',
                    fontSize: '0.875rem'
                  }}>
                    {erroAcao}
                  </div>
                )}

                <div className="checkin-card-instrucao">
                  <span>Sede Mútua-PI • Teresina</span>
                  <strong>Recepção Central • 2º Andar</strong>
                </div>

                <div className="checkin-acoes-botoes">
                  <button
                    type="button"
                    className="btn btn-secundario"
                    disabled={processandoAcao}
                    onClick={() => setReservaParaCheckin(null)}
                  >
                    Agora Não
                  </button>
                  <button
                    type="button"
                    className="btn btn-primario"
                    disabled={processandoAcao}
                    onClick={handleExecutarCheckin}
                  >
                    {processandoAcao ? 'Validando...' : 'Confirmar Minha Presença'}
                  </button>
                </div>
              </div>
            )}
        </Janela>
      )}
    </div>
  )
}
