import { useState, useEffect, useMemo } from 'react'
import {
  adminService,
  type SolicitacaoPendente,
  type MovimentacaoBalcao,
  type MetricasAdmin,
  type RegistroHistorico,
  type StatusHistorico,
  type TipoRecursoHistorico,
} from '../../services/adminService'
import type { CondicaoEquipamento } from '../../types'
import HistoricoModalAuditoria from './HistoricoModalAuditoria'
import './Admin.css'

export default function AdminPage() {
  const [abaAtiva, setAbaAtiva] = useState<'pendencias' | 'balcao' | 'inventario' | 'historico'>('pendencias')
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null)
  const [pendencias, setPendencias] = useState<SolicitacaoPendente[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoBalcao[]>([])
  const [historico, setHistorico] = useState<RegistroHistorico[]>([])
  const [carregando, setCarregando] = useState(true)

  // Filtros do Histórico
  const [buscaHistorico, setBuscaHistorico] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoRecursoHistorico>('todos')
  const [statusFiltro, setStatusFiltro] = useState<'todos' | StatusHistorico>('todos')
  const [dataInicioFiltro, setDataInicioFiltro] = useState('')
  const [dataFimFiltro, setDataFimFiltro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 5

  // Modais
  const [solicitacaoParaRecusa, setSolicitacaoParaRecusa] =
    useState<SolicitacaoPendente | null>(null)
  const [motivoRecusa, setMotivoRecusa] = useState('')
  const [movimentacaoParaDevolucao, setMovimentacaoParaDevolucao] =
    useState<MovimentacaoBalcao | null>(null)
  const [condicaoDevolucao, setCondicaoDevolucao] = useState<CondicaoEquipamento>('otimo')
  const [obsDevolucao, setObsDevolucao] = useState('')
  const [registroParaAuditoria, setRegistroParaAuditoria] = useState<RegistroHistorico | null>(null)
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null)

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true)
      try {
        const [dadosMetricas, dadosPendencias, dadosMov, dadosHist] = await Promise.all([
          adminService.obterMetricas(),
          adminService.listarPendencias(),
          adminService.listarMovimentacoes(),
          adminService.listarHistorico(),
        ])
        setMetricas(dadosMetricas)
        setPendencias(dadosPendencias)
        setMovimentacoes(dadosMov)
        setHistorico(dadosHist)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  // Filtragem reativa do histórico
  const historicoFiltrado = useMemo(() => {
    let lista = [...historico]

    if (buscaHistorico.trim()) {
      const termo = buscaHistorico.toLowerCase().trim()
      lista = lista.filter(
        (item) =>
          item.profissionalNome.toLowerCase().includes(termo) ||
          item.registroCrea.toLowerCase().includes(termo) ||
          item.recursoNome.toLowerCase().includes(termo) ||
          item.patrimonioOuLocal.toLowerCase().includes(termo) ||
          item.protocolo.toLowerCase().includes(termo)
      )
    }

    if (tipoFiltro !== 'todos') {
      lista = lista.filter((item) => item.tipo === tipoFiltro)
    }

    if (statusFiltro !== 'todos') {
      lista = lista.filter((item) => item.status === statusFiltro)
    }

    if (dataInicioFiltro) {
      lista = lista.filter((item) => item.dataInicio >= dataInicioFiltro)
    }

    if (dataFimFiltro) {
      lista = lista.filter((item) => item.dataFim <= dataFimFiltro)
    }

    return lista
  }, [historico, buscaHistorico, tipoFiltro, statusFiltro, dataInicioFiltro, dataFimFiltro])

  const totalPaginas = Math.ceil(historicoFiltrado.length / itensPorPagina) || 1
  const historicoPaginado = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    return historicoFiltrado.slice(inicio, inicio + itensPorPagina)
  }, [historicoFiltrado, paginaAtual, itensPorPagina])

  const limparFiltrosHistorico = () => {
    setBuscaHistorico('')
    setTipoFiltro('todos')
    setStatusFiltro('todos')
    setDataInicioFiltro('')
    setDataFimFiltro('')
    setPaginaAtual(1)
  }

  const dispararFeedback = (msg: string) => {
    setFeedbackMensagem(msg)
    setTimeout(() => setFeedbackMensagem(null), 3500)
  }

  // Aprovação
  const handleAprovar = async (sol: SolicitacaoPendente) => {
    await adminService.aprovarSolicitacao(sol.id)
    setPendencias((prev) => prev.filter((p) => p.id !== sol.id))
    if (metricas) {
      setMetricas({ ...metricas, solicitacoesPendentes: metricas.solicitacoesPendentes - 1 })
    }
    dispararFeedback(`Solicitação ${sol.protocolo} aprovada com sucesso! O associado foi notificado.`)
  }

  // Recusa
  const handleConfirmarRecusa = async () => {
    if (!solicitacaoParaRecusa) return
    await adminService.recusarSolicitacao(
      solicitacaoParaRecusa.id,
      motivoRecusa || 'Incompatibilidade com o regulamento de uso'
    )
    setPendencias((prev) => prev.filter((p) => p.id !== solicitacaoParaRecusa.id))
    if (metricas) {
      setMetricas({ ...metricas, solicitacoesPendentes: metricas.solicitacoesPendentes - 1 })
    }
    dispararFeedback(`Solicitação ${solicitacaoParaRecusa.protocolo} recusada. Notificação enviada.`)
    setSolicitacaoParaRecusa(null)
    setMotivoRecusa('')
  }

  // Devolução no Balcão
  const handleConfirmarDevolucao = async () => {
    if (!movimentacaoParaDevolucao) return
    await adminService.registrarDevolucao(
      movimentacaoParaDevolucao.id,
      condicaoDevolucao,
      obsDevolucao
    )

    setMovimentacoes((prev) =>
      prev.map((m) =>
        m.id === movimentacaoParaDevolucao.id
          ? {
              ...m,
              statusMovimentacao: 'devolvido',
              condicaoDevolucao,
              dataDevolucaoEfetiva: new Date().toISOString(),
            }
          : m
      )
    )

    if (metricas) {
      setMetricas({ ...metricas, equipamentosEmCampo: Math.max(0, metricas.equipamentosEmCampo - 1) })
    }

    dispararFeedback(
      `Devolução do equipamento ${movimentacaoParaDevolucao.patrimonio} registrada com sucesso no balcão.`
    )
    setMovimentacaoParaDevolucao(null)
    setObsDevolucao('')
  }

  const formatarDataHora = (iso: string) => {
    try {
      const d = new Date(iso)
      return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return iso
    }
  }

  return (
    <div className="admin-page-container">
      {/* Toast Feedback */}
      {feedbackMensagem && (
        <div className="toast-admin-feedback">
          <span className="toast-icone">✓</span>
          <span>{feedbackMensagem}</span>
        </div>
      )}

      {/* ============================================================
          CABEÇALHO ADMINISTRATIVO
          ============================================================ */}
      <header className="admin-cabecalho">
        <div>
          <div className="badge-gestao-admin">
            <span className="ponto-status-admin" />
            <span>Módulo de Gestão • Diretoria & Secretaria Mútua-PI</span>
          </div>
          <h1 className="admin-titulo">Painel Administrativo da Mútua-PI</h1>
          <p className="admin-subtitulo">
            Despacho de solicitações técnicas, controle presencial do balcão do Crea Tec HUB e
            fiscalização do uso dos espaços institucionais.
          </p>
        </div>
      </header>

      {/* ============================================================
          METRICAS GERAIS DE ADMINISTRAÇÃO (KPIS)
          ============================================================ */}
      <section className="admin-kpis-grid">
        <div className="admin-kpi-card card-kpi-pendentes">
          <div className="kpi-icone-box icone-laranja">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className="kpi-info-bloco">
            <span className="kpi-valor-grande">{metricas?.solicitacoesPendentes ?? 3}</span>
            <span className="kpi-rotulo-texto">Solicitações Pendentes</span>
            <span className="kpi-descricao-texto">Aguardando parecer da gestão</span>
          </div>
        </div>

        <div className="admin-kpi-card card-kpi-campo">
          <div className="kpi-icone-box icone-azul">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="kpi-info-bloco">
            <span className="kpi-valor-grande">{metricas?.equipamentosEmCampo ?? 1}</span>
            <span className="kpi-rotulo-texto">Equipamentos em Campo</span>
            <span className="kpi-descricao-texto">Com termo de guarda ativo</span>
          </div>
        </div>

        <div className="admin-kpi-card card-kpi-ocupacao">
          <div className="kpi-icone-box icone-verde">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
            </svg>
          </div>
          <div className="kpi-info-bloco">
            <span className="kpi-valor-grande">{metricas?.taxaOcupacaoSalas ?? '82%'}</span>
            <span className="kpi-rotulo-texto">Taxa de Ocupação</span>
            <span className="kpi-descricao-texto">Média de uso dos espaços</span>
          </div>
        </div>

        <div className="admin-kpi-card card-kpi-associados">
          <div className="kpi-icone-box icone-roxo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-info-bloco">
            <span className="kpi-valor-grande">{metricas?.profissionaisAtivos ?? 312}</span>
            <span className="kpi-rotulo-texto">Associados Habilitados</span>
            <span className="kpi-descricao-texto">Com anuidade regular</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          ABAS DE NAVEGAÇÃO ADMINISTRATIVA
          ============================================================ */}
      <section className="admin-abas-secao">
        <div className="admin-abas-navegacao">
          <button
            type="button"
            className={`admin-aba-btn ${abaAtiva === 'pendencias' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('pendencias')}
          >
            <span>📥 Fila de Despacho & Aprovações</span>
            {pendencias.length > 0 && (
              <span className="badge-contagem-alerta">{pendencias.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-aba-btn ${abaAtiva === 'balcao' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('balcao')}
          >
            <span>🔄 Balcão de Retiradas & Devoluções HUB</span>
          </button>

          <button
            type="button"
            className={`admin-aba-btn ${abaAtiva === 'inventario' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('inventario')}
          >
            <span>🏢 Status dos Espaços da Sede</span>
          </button>

          <button
            type="button"
            className={`admin-aba-btn ${abaAtiva === 'historico' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('historico')}
          >
            <span>📜 Histórico Geral & Auditoria</span>
          </button>
        </div>

        {/* ============================================================
            CONTEÚDO DA ABA 1: PENDÊNCIAS DE APROVAÇÃO
            ============================================================ */}
        {abaAtiva === 'pendencias' && (
          <div className="admin-conteudo-aba">
            {carregando ? (
              <div className="admin-carregando">Carregando solicitações...</div>
            ) : pendencias.length === 0 ? (
              <div className="admin-empty-bloco">
                <span className="empty-icone-admin">✨</span>
                <h3>Tudo em dia! Nenhuma solicitação pendente.</h3>
                <p>Todas as solicitações de auditório e equipamentos foram despachadas pela gestão.</p>
              </div>
            ) : (
              <div className="grid-pendencias-cards">
                {pendencias.map((sol) => (
                  <div key={sol.id} className="card-pendencia-admin">
                    <div className="pendencia-topo">
                      <div className="pendencia-tag-tipo">
                        {sol.tipo === 'ambiente' ? '🏢 Espaço Nobre' : '🛰️ Equipamento HUB'}
                      </div>
                      <span className="pendencia-protocolo">{sol.protocolo}</span>
                    </div>

                    <h3 className="pendencia-item-titulo">{sol.itemNome}</h3>
                    <p className="pendencia-item-local">{sol.patrimonioOuLocal}</p>

                    {/* Dados do Solicitante */}
                    <div className="box-dados-solicitante">
                      <div className="dado-solicitante-linha">
                        <span className="rotulo-sol">Profissional:</span>
                        <strong>{sol.profissionalNome}</strong>
                      </div>
                      <div className="dado-solicitante-linha">
                        <span className="rotulo-sol">Registro CREA-PI:</span>
                        <span>{sol.registroCrea}</span>
                      </div>
                      <div className="dado-solicitante-linha">
                        <span className="rotulo-sol">Período Solicitado:</span>
                        <span>
                          {formatarDataHora(sol.dataInicio)} até {formatarDataHora(sol.dataFim)}
                        </span>
                      </div>
                      {sol.documentoVinculado && (
                        <div className="dado-solicitante-linha">
                          <span className="rotulo-sol">Documentos:</span>
                          <span className="tag-doc-vinculado">{sol.documentoVinculado}</span>
                        </div>
                      )}
                    </div>

                    <div className="pendencia-finalidade">
                      <span className="finalidade-rotulo-admin">Finalidade Informada:</span>
                      <p className="finalidade-texto-admin">{sol.finalidade}</p>
                    </div>

                    {/* Ações de Despacho */}
                    <div className="pendencia-acoes-rodape">
                      <button
                        type="button"
                        className="btn btn-recusar-admin"
                        onClick={() => setSolicitacaoParaRecusa(sol)}
                      >
                        Recusar / Pedir Ajuste
                      </button>
                      <button
                        type="button"
                        className="btn btn-aprovar-admin"
                        onClick={() => handleAprovar(sol)}
                      >
                        ✓ Aprovar Solicitação
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            CONTEÚDO DA ABA 2: BALCÃO DE RETIRADA & DEVOLUÇÃO
            ============================================================ */}
        {abaAtiva === 'balcao' && (
          <div className="admin-conteudo-aba">
            <div className="balcao-tabela-wrapper">
              <table className="balcao-tabela">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Equipamento</th>
                    <th>Patrimônio</th>
                    <th>Profissional Associado</th>
                    <th>Previsão Devolução</th>
                    <th>Status em Balcão</th>
                    <th style={{ textAlign: 'right' }}>Ação de Checklist</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td className="celula-protocolo">{mov.protocolo}</td>
                      <td className="celula-nome">{mov.equipamentoNome}</td>
                      <td>
                        <span className="tag-patrimonio-tabela">{mov.patrimonio}</span>
                      </td>
                      <td>
                        <div className="celula-profissional">
                          <strong>{mov.profissionalNome}</strong>
                          <span>{mov.registroCrea}</span>
                        </div>
                      </td>
                      <td>{formatarDataHora(mov.dataDevolucaoPrevista)}</td>
                      <td>
                        <span className={`badge-balcao-status status-${mov.statusMovimentacao}`}>
                          {mov.statusMovimentacao === 'em_campo' && '● Em Campo'}
                          {mov.statusMovimentacao === 'devolvido' && '✓ Devolvido'}
                          {mov.statusMovimentacao === 'aguardando_retirada' && '⏳ Aguarda Retirada'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {mov.statusMovimentacao === 'em_campo' ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-devolver-tabela"
                            onClick={() => {
                              setMovimentacaoParaDevolucao(mov)
                              setCondicaoDevolucao('otimo')
                            }}
                          >
                            Registrar Devolução
                          </button>
                        ) : (
                          <span className="texto-concluido-tabela">Finalizado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            CONTEÚDO DA ABA 3: INVENTÁRIO & DISPONIBILIDADE DA SEDE
            ============================================================ */}
        {abaAtiva === 'inventario' && (
          <div className="admin-conteudo-aba">
            <div className="inventario-grid-cards">
              <div className="inventario-card">
                <div className="inventario-card-topo">
                  <span className="inventario-tipo-tag">🏢 Espaço Físico</span>
                  <span className="badge-inventario-livre">Operacional</span>
                </div>
                <h4 className="inventario-nome">Espaço Coworking Compartilhado</h4>
                <p className="inventario-detalhes">Capacidade: 24 profissionais • Térreo Ala Sul</p>
                <div className="inventario-recursos-mini">
                  <span>Wi-Fi 6</span> • <span>Climatização</span> • <span>Café</span>
                </div>
              </div>

              <div className="inventario-card">
                <div className="inventario-card-topo">
                  <span className="inventario-tipo-tag">🤝 Sala Privativa</span>
                  <span className="badge-inventario-livre">Operacional</span>
                </div>
                <h4 className="inventario-nome">Sala de Reuniões Executiva A</h4>
                <p className="inventario-detalhes">Capacidade: 8 pessoas • 2º Andar Sala 204</p>
                <div className="inventario-recursos-mini">
                  <span>Smart TV 65"</span> • <span>Videoconferência</span> • <span>Lousa de Vidro</span>
                </div>
              </div>

              <div className="inventario-card">
                <div className="inventario-card-topo">
                  <span className="inventario-tipo-tag">🎙️ Auditório Solene</span>
                  <span className="badge-inventario-livre">Operacional</span>
                </div>
                <h4 className="inventario-nome">Auditório Master Cláudio Portella</h4>
                <p className="inventario-detalhes">Capacidade: 60 pessoas • 3º Andar</p>
                <div className="inventario-recursos-mini">
                  <span>Projetor Laser 6000L</span> • <span>Som Digital</span> • <span>Púlpito</span>
                </div>
              </div>

              <div className="inventario-card">
                <div className="inventario-card-topo">
                  <span className="inventario-tipo-tag">🛰️ Equipamento HUB</span>
                  <span className="badge-inventario-livre">Disponível</span>
                </div>
                <h4 className="inventario-nome">Drone DJI Phantom 4 RTK (HUB-0042)</h4>
                <p className="inventario-detalhes">Baterias: 3 unidades testadas • Calibrado</p>
                <div className="inventario-recursos-mini">
                  <span>Câmera 20MP</span> • <span>RTK Centimétrico</span> • <span>Maleta Rígida</span>
                </div>
              </div>

              <div className="inventario-card">
                <div className="inventario-card-topo">
                  <span className="inventario-tipo-tag">📷 Equipamento HUB</span>
                  <span className="badge-inventario-livre">Disponível</span>
                </div>
                <h4 className="inventario-nome">Câmera Termográfica FLIR E8-XT (HUB-0019)</h4>
                <p className="inventario-detalhes">Calibração válida até Dez/2026</p>
                <div className="inventario-recursos-mini">
                  <span>320x240 pixels</span> • <span>Faixa -20°C a 550°C</span> • <span>MSX</span>
                </div>
              </div>

              <div className="inventario-card">
                <div className="inventario-card-topo">
                  <span className="inventario-tipo-tag">📐 Equipamento HUB</span>
                  <span className="badge-inventario-campo">Em Campo</span>
                </div>
                <h4 className="inventario-nome">Estação Total Leica FlexLine TS07 (HUB-0008)</h4>
                <p className="inventario-detalhes">Em uso com Eng. Marcelo Cavalcante</p>
                <div className="inventario-recursos-mini">
                  <span>Precisão 2"</span> • <span>Tripé + Prisma</span> • <span>Devolução: 22/10</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            CONTEÚDO DA ABA 4: HISTÓRICO GERAL & AUDITORIA
            ============================================================ */}
        {abaAtiva === 'historico' && (
          <div className="admin-conteudo-aba">
            {/* Barra de Filtros do Histórico */}
            <div className="historico-filtros-card">
              <div className="historico-filtros-grid">
                <div className="grupo-filtro-item">
                  <label htmlFor="busca-hist" className="label-filtro-admin">
                    Buscar Associado / Recurso
                  </label>
                  <input
                    id="busca-hist"
                    type="text"
                    placeholder="Nome, CREA, patrimônio ou protocolo..."
                    value={buscaHistorico}
                    onChange={(e) => {
                      setBuscaHistorico(e.target.value)
                      setPaginaAtual(1)
                    }}
                    className="input-busca-historico"
                  />
                </div>

                <div className="grupo-filtro-item">
                  <label htmlFor="tipo-filtro-hist" className="label-filtro-admin">
                    Categoria
                  </label>
                  <select
                    id="tipo-filtro-hist"
                    value={tipoFiltro}
                    onChange={(e) => {
                      setTipoFiltro(e.target.value as TipoRecursoHistorico)
                      setPaginaAtual(1)
                    }}
                    className="select-filtro-historico"
                  >
                    <option value="todos">Todos os Recursos</option>
                    <option value="ambiente">🏢 Espaços da Sede</option>
                    <option value="equipamento">🛰️ Equipamentos HUB</option>
                  </select>
                </div>

                <div className="grupo-filtro-item">
                  <label htmlFor="status-filtro-hist" className="label-filtro-admin">
                    Status da Reserva
                  </label>
                  <select
                    id="status-filtro-hist"
                    value={statusFiltro}
                    onChange={(e) => {
                      setStatusFiltro(e.target.value as 'todos' | StatusHistorico)
                      setPaginaAtual(1)
                    }}
                    className="select-filtro-historico"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="concluida">✓ Concluídas</option>
                    <option value="em_uso">● Em Uso</option>
                    <option value="cancelada">✕ Canceladas</option>
                    <option value="recusada">✕ Recusadas</option>
                  </select>
                </div>

                <div className="grupo-filtro-item">
                  <label htmlFor="data-inicio-hist" className="label-filtro-admin">
                    A Partir de
                  </label>
                  <input
                    id="data-inicio-hist"
                    type="date"
                    value={dataInicioFiltro}
                    onChange={(e) => {
                      setDataInicioFiltro(e.target.value)
                      setPaginaAtual(1)
                    }}
                    className="input-busca-historico"
                  />
                </div>

                <div className="grupo-filtro-item">
                  <label htmlFor="data-fim-hist" className="label-filtro-admin">
                    Até a Data
                  </label>
                  <input
                    id="data-fim-hist"
                    type="date"
                    value={dataFimFiltro}
                    onChange={(e) => {
                      setDataFimFiltro(e.target.value)
                      setPaginaAtual(1)
                    }}
                    className="input-busca-historico"
                  />
                </div>

                <div className="grupo-filtro-item">
                  <button
                    type="button"
                    onClick={limparFiltrosHistorico}
                    className="btn-limpar-filtros"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de Metadados / Contagem */}
            <div className="historico-meta-barra">
              <span>
                Exibindo <strong>{historicoFiltrado.length}</strong> registro(s) histórico(s)
                {buscaHistorico || tipoFiltro !== 'todos' || statusFiltro !== 'todos' || dataInicioFiltro || dataFimFiltro ? ' (filtrados)' : ''}
              </span>
              <span>Página {paginaAtual} de {totalPaginas}</span>
            </div>

            {/* Tabela do Histórico */}
            {carregando ? (
              <div className="admin-carregando">Carregando histórico...</div>
            ) : historicoFiltrado.length === 0 ? (
              <div className="admin-empty-bloco">
                <span className="empty-icone-admin">🔍</span>
                <h3>Nenhum registro encontrado</h3>
                <p>Nenhuma reserva ou empréstimo corresponde aos critérios de pesquisa selecionados.</p>
                <button
                  type="button"
                  className="btn btn-secundario"
                  style={{ marginTop: '0.75rem' }}
                  onClick={limparFiltrosHistorico}
                >
                  Restaurar Filtros Padrão
                </button>
              </div>
            ) : (
              <>
                <div className="historico-tabela-wrapper">
                  <table className="historico-tabela">
                    <thead>
                      <tr>
                        <th>Protocolo</th>
                        <th>Recurso & Patrimônio</th>
                        <th>Associado (CREA / LGPD)</th>
                        <th>Período Contratado</th>
                        <th>Status do Processo</th>
                        <th style={{ textAlign: 'right' }}>Auditoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoPaginado.map((item) => (
                        <tr key={item.id}>
                          <td className="celula-protocolo">{item.protocolo}</td>
                          <td className="celula-recurso">
                            <span className="badge-tipo-tag">
                              {item.tipo === 'ambiente' ? '🏢 Espaço' : '🛰️ HUB'}
                            </span>
                            <strong>{item.recursoNome}</strong>
                            <span>{item.patrimonioOuLocal}</span>
                          </td>
                          <td className="celula-associado">
                            <strong>{item.profissionalNome}</strong>
                            <div>
                              <span className="crea-tag">{item.registroCrea}</span>
                              <span className="tag-lgpd-cpf" title="CPF protegido pela LGPD">
                                {item.cpfMascarado}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.78rem' }}>
                              <span>{formatarDataHora(item.dataInicio)}</span>
                              <div style={{ color: 'var(--cor-texto-mutado)' }}>
                                até {formatarDataHora(item.dataFim)}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status-tabela status-${item.status}`}>
                              {item.status === 'concluida' && '✓ Concluída'}
                              {item.status === 'em_uso' && '● Em Uso'}
                              {item.status === 'cancelada' && '✕ Cancelada'}
                              {item.status === 'recusada' && '✕ Recusada'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-inspecionar-auditoria"
                              onClick={() => setRegistroParaAuditoria(item)}
                            >
                              Ver Auditoria
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div className="paginacao-historico-container">
                    <span>
                      Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a {Math.min(paginaAtual * itensPorPagina, historicoFiltrado.length)} de {historicoFiltrado.length}
                    </span>
                    <div className="paginacao-botoes-grupo">
                      <button
                        type="button"
                        className="btn-paginacao"
                        disabled={paginaAtual === 1}
                        onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                      >
                        ← Anterior
                      </button>
                      <button
                        type="button"
                        className="btn-paginacao"
                        disabled={paginaAtual === totalPaginas}
                        onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                      >
                        Próxima →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* ============================================================
          MODAL DE RECUSA / AJUSTE DE SOLICITAÇÃO
          ============================================================ */}
      {solicitacaoParaRecusa && (
        <div className="modal-admin-overlay" onClick={() => setSolicitacaoParaRecusa(null)}>
          <div
            className="modal-admin-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-admin-cabecalho">
              <h3>Recusar ou Solicitar Ajuste</h3>
              <button
                type="button"
                className="btn-fechar-admin"
                onClick={() => setSolicitacaoParaRecusa(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-admin-corpo">
              <p className="texto-aviso-recusa">
                Informe a justificativa técnica para a recusa de{' '}
                <strong>{solicitacaoParaRecusa.itemNome}</strong> (Protocolo{' '}
                {solicitacaoParaRecusa.protocolo}) do associado{' '}
                <strong>{solicitacaoParaRecusa.profissionalNome}</strong>:
              </p>

              <textarea
                rows={4}
                required
                placeholder="Ex: Anuidade em aberto com pendência financeira, falta de ART registrada ou choque de horário com evento oficial da Mútua..."
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                className="textarea-recusa-admin"
              />

              <div className="modal-admin-acoes">
                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={() => setSolicitacaoParaRecusa(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-confirmar-recusa"
                  onClick={handleConfirmarRecusa}
                >
                  Confirmar Recusa e Notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE CHECKLIST DE DEVOLUÇÃO NO BALCÃO
          ============================================================ */}
      {movimentacaoParaDevolucao && (
        <div className="modal-admin-overlay" onClick={() => setMovimentacaoParaDevolucao(null)}>
          <div
            className="modal-admin-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-admin-cabecalho">
              <div>
                <span className="subtitulo-admin-modal">Conferência Presencial de Balcão</span>
                <h3>Devolução: {movimentacaoParaDevolucao.equipamentoNome}</h3>
              </div>
              <button
                type="button"
                className="btn-fechar-admin"
                onClick={() => setMovimentacaoParaDevolucao(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-admin-corpo">
              <div className="box-resumo-devolucao">
                <div>
                  <span className="rotulo-dev">Patrimônio:</span>
                  <strong>{movimentacaoParaDevolucao.patrimonio}</strong>
                </div>
                <div>
                  <span className="rotulo-dev">Associado Responsável:</span>
                  <strong>{movimentacaoParaDevolucao.profissionalNome}</strong>
                </div>
              </div>

              {/* Avaliação da Condição Física */}
              <div className="campo-grupo-admin">
                <label className="label-admin">Estado de Conservação na Devolução *</label>
                <select
                  value={condicaoDevolucao}
                  onChange={(e) => setCondicaoDevolucao(e.target.value as CondicaoEquipamento)}
                  className="select-condicao-admin"
                >
                  <option value="otimo">✓ Ótimo — Sem arranhões, limpo e calibrado</option>
                  <option value="bom">✓ Bom — Sinais normais de uso leve em campo</option>
                  <option value="regular">⚠️ Regular — Desgaste visível ou sujeira intensa</option>
                  <option value="danificado">✕ Avaria / Danificado — Exige laudo pericial</option>
                </select>
              </div>

              {/* Checklist de Itens */}
              <div className="checklist-balcao-caixa">
                <span className="checklist-titulo">Itens Conferidos na Maleta:</span>
                <label className="checkbox-item-checklist">
                  <input type="checkbox" defaultChecked />
                  <span>Baterias conferidas e íntegras</span>
                </label>
                <label className="checkbox-item-checklist">
                  <input type="checkbox" defaultChecked />
                  <span>Cabos, carregador e conectores originais presentes</span>
                </label>
                <label className="checkbox-item-checklist">
                  <input type="checkbox" defaultChecked />
                  <span>Maleta rígida sem travas quebradas</span>
                </label>
              </div>

              {/* Observações da Devolução */}
              <div className="campo-grupo-admin">
                <label className="label-admin">Observações do Atendente de Balcão</label>
                <input
                  type="text"
                  placeholder="Ex: Devolvido com carga completa, testado no ato sem anomalias..."
                  value={obsDevolucao}
                  onChange={(e) => setObsDevolucao(e.target.value)}
                  className="input-admin-padrao"
                />
              </div>

              <div className="modal-admin-acoes">
                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={() => setMovimentacaoParaDevolucao(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primario"
                  onClick={handleConfirmarDevolucao}
                >
                  Concluir Devolução e Liberar Bem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE AUDITORIA E LINHA DO TEMPO
          ============================================================ */}
      {registroParaAuditoria && (
        <HistoricoModalAuditoria
          registro={registroParaAuditoria}
          aoFechar={() => setRegistroParaAuditoria(null)}
        />
      )}
    </div>
  )
}
