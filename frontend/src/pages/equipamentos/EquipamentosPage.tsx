import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EQUIPAMENTOS_INICIAIS,
  equipamentoService,
  type EquipamentoCompleto,
} from '../../services/equipamentoService'
import './Equipamentos.css'

export default function EquipamentosPage() {
  const navigate = useNavigate()

  // Estados de filtro
  const [termoBusca, setTermoBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [statusFiltro, setStatusFiltro] = useState('todos')

  // Estados do modal de solicitação
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<EquipamentoCompleto | null>(
    null
  )
  const [dataRetirada, setDataRetirada] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  )
  const [horarioRetirada, setHorarioRetirada] = useState('08:30')
  const [dataDevolucao, setDataDevolucao] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  )
  const [horarioDevolucao, setHorarioDevolucao] = useState('17:00')
  const [finalidade, setFinalidade] = useState('')
  const [numeroArt, setNumeroArt] = useState('')
  const [concordouTermo, setConcordouTermo] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [solicitacaoConfirmada, setSolicitacaoConfirmada] = useState<{
    protocolo: string
    equipamentoNome: string
    patrimonio: string
    periodo: string
  } | null>(null)

  // Categorias únicas extraídas dos equipamentos
  const categorias = useMemo(() => {
    const cats = new Set(EQUIPAMENTOS_INICIAIS.map((e) => e.categoria))
    return Array.from(cats)
  }, [])

  // Filtragem dos equipamentos em tempo real
  const equipamentosFiltrados = useMemo(() => {
    return EQUIPAMENTOS_INICIAIS.filter((item) => {
      // Filtro de Categoria
      if (categoriaFiltro !== 'todas' && item.categoria !== categoriaFiltro) return false

      // Filtro de Status
      if (statusFiltro !== 'todos' && item.status !== statusFiltro) return false

      // Filtro de Busca por texto
      if (termoBusca.trim()) {
        const termo = termoBusca.toLowerCase()
        const bateuNome = item.nome.toLowerCase().includes(termo)
        const bateuPatrimonio = item.patrimonio.toLowerCase().includes(termo)
        const bateuCategoria = item.categoria.toLowerCase().includes(termo)
        const bateuDesc = item.descricao ? item.descricao.toLowerCase().includes(termo) : false
        const bateuSpec = item.especificacoes.some((s) => s.toLowerCase().includes(termo))
        if (!bateuNome && !bateuPatrimonio && !bateuCategoria && !bateuDesc && !bateuSpec)
          return false
      }

      return true
    })
  }, [categoriaFiltro, statusFiltro, termoBusca])

  // Submissão da solicitação de empréstimo
  const handleConfirmarSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipamentoSelecionado) return

    setEnviando(true)

    try {
      await equipamentoService.solicitarEmprestimo({
        equipamentoId: equipamentoSelecionado.id,
        dataRetirada,
        horarioRetirada,
        dataDevolucao,
        horarioDevolucao,
        finalidade: finalidade.trim() || 'Serviço técnico profissional de engenharia',
        numeroArt: numeroArt.trim() || undefined,
      })

      const protocoloGerado =
        'HUB-' +
        new Date().getFullYear() +
        '-' +
        Math.floor(1000 + Math.random() * 9000)

      setSolicitacaoConfirmada({
        protocolo: protocoloGerado,
        equipamentoNome: equipamentoSelecionado.nome,
        patrimonio: equipamentoSelecionado.patrimonio,
        periodo: `${new Date(dataRetirada + 'T12:00:00').toLocaleDateString('pt-BR')} às ${horarioRetirada} até ${new Date(dataDevolucao + 'T12:00:00').toLocaleDateString('pt-BR')} às ${horarioDevolucao}`,
      })
    } catch {
      alert('Não foi possível registrar a solicitação de empréstimo.')
    } finally {
      setEnviando(false)
    }
  }

  const fecharModal = () => {
    setEquipamentoSelecionado(null)
    setSolicitacaoConfirmada(null)
    setFinalidade('')
    setNumeroArt('')
  }

  // Contadores rápidos para o header
  const totalEquipamentos = EQUIPAMENTOS_INICIAIS.length
  const totalDisponiveis = EQUIPAMENTOS_INICIAIS.filter((e) => e.status === 'disponivel').length
  const totalEmUso = EQUIPAMENTOS_INICIAIS.filter((e) => e.status === 'em_uso').length

  return (
    <div className="equipamentos-page-container">
      {/* ============================================================
          CABEÇALHO DA PÁGINA COM IDENTIDADE CREA TEC HUB
          ============================================================ */}
      <header className="hub-cabecalho-bloco">
        <div className="hub-cabecalho-conteudo">
          <div className="badge-tecnologia-hub">
            <span className="ponto-pulso-hub" />
            <span>Crea Tec HUB • Inovação Mútua-PI / CREA-PI</span>
          </div>

          <h1 className="hub-titulo">Equipamentos Tecnológicos de Alta Precisão</h1>
          <p className="hub-subtitulo">
            Aparelhos homologados disponíveis para empréstimo institucional a profissionais associados. 
            Utilize tecnologia de ponta em suas vistorias, laudos periciais e obras.
          </p>
        </div>

        {/* Indicadores Rápidos de Prontidão */}
        <div className="hub-metricas-prontidao">
          <div className="metrica-prontidao-item">
            <span className="prontidao-valor">{totalEquipamentos}</span>
            <span className="prontidao-rotulo">Aparelhos</span>
          </div>
          <div className="prontidao-divisor" />
          <div className="metrica-prontidao-item">
            <span className="prontidao-valor destaque-verde">{totalDisponiveis} Prontos</span>
            <span className="prontidao-rotulo">Para Retirada</span>
          </div>
          <div className="prontidao-divisor" />
          <div className="metrica-prontidao-item">
            <span className="prontidao-valor destaque-ambar">{totalEmUso} Em Campo</span>
            <span className="prontidao-rotulo">Com Associados</span>
          </div>
        </div>
      </header>

      {/* ============================================================
          BARRA DE PESQUISA E FILTROS DINÂMICOS
          ============================================================ */}
      <section className="barra-filtros-hub">
        <div className="busca-hub-wrapper">
          <span className="icone-lupa-hub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por patrimônio (ex: HUB-0042), drone, FLIR, RTK, topografia..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="input-busca-hub"
          />
          {termoBusca && (
            <button
              type="button"
              className="btn-limpar-busca-hub"
              onClick={() => setTermoBusca('')}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filtros-linha-hub">
          {/* Categorias em Pílulas */}
          <div className="grupo-pilulas-hub">
            <button
              type="button"
              className={`pilula-hub ${categoriaFiltro === 'todas' ? 'pilula-hub-ativa' : ''}`}
              onClick={() => setCategoriaFiltro('todas')}
            >
              Todas as Categorias ({totalEquipamentos})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pilula-hub ${categoriaFiltro === cat ? 'pilula-hub-ativa' : ''}`}
                onClick={() => setCategoriaFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtro por Status */}
          <div className="seletor-status-wrapper">
            <label htmlFor="filtro-status" className="label-filtro-status">
              Disponibilidade:
            </label>
            <select
              id="filtro-status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="select-status-hub"
            >
              <option value="todos">Todos os status</option>
              <option value="disponivel">Apenas Disponíveis</option>
              <option value="em_uso">Em Uso em Campo</option>
              <option value="manutencao">Em Manutenção/Calibração</option>
            </select>
          </div>
        </div>
      </section>

      {/* ============================================================
          GRID DE CARDS DE EQUIPAMENTOS
          ============================================================ */}
      <section className="grid-equipamentos-cards">
        {equipamentosFiltrados.length === 0 ? (
          <div className="empty-state-hub">
            <span className="empty-icone-hub">🔍</span>
            <h3 className="empty-titulo-hub">Nenhum equipamento encontrado</h3>
            <p className="empty-desc-hub">
              Nenhum item corresponde aos critérios de pesquisa selecionados. Tente limpar os filtros
              ou pesquisar por outro termo técnico.
            </p>
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => {
                setTermoBusca('')
                setCategoriaFiltro('todas')
                setStatusFiltro('todos')
              }}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          equipamentosFiltrados.map((item) => (
            <div key={item.id} className="card-equipamento-detalhado">
              {/* Header com Status e Patrimônio */}
              <div className="banner-equipamento-cabecalho">
                <span className={`badge-status-aparelho status-aparelho-${item.status}`}>
                  {item.status === 'disponivel' && '● Disponível para Empréstimo'}
                  {item.status === 'em_uso' && '⏳ Em Campo com Associado'}
                  {item.status === 'manutencao' && '🔧 Calibração / Manutenção'}
                </span>

                <div className="patrimonio-etiqueta-bloco">
                  <span className="patrimonio-rotulo">PATRIMÔNIO</span>
                  <span className="patrimonio-codigo">{item.patrimonio}</span>
                </div>

                <div className="icone-tecnologia-ilustracao">
                  {item.categoria.includes('Drones') && '🛰️'}
                  {item.categoria.includes('Termografia') && '📷'}
                  {item.categoria.includes('Topografia') && '📐'}
                  {item.categoria.includes('Estruturas') && '🔨'}
                  {item.categoria.includes('Elétrica') && '⚡'}
                </div>
              </div>

              {/* Corpo com Informações Técnicas */}
              <div className="card-equipamento-corpo">
                <span className="categoria-equip-rotulo">{item.categoria}</span>
                <h2 className="equipamento-card-nome">{item.nome}</h2>
                <p className="equipamento-card-desc">{item.descricao}</p>

                {/* Especificações Técnicas */}
                <div className="bloco-specs-tecnicas">
                  <span className="specs-titulo">Destaques Técnicos:</span>
                  <ul className="lista-specs-itens">
                    {item.especificacoes.slice(0, 3).map((spec, i) => (
                      <li key={i} className="spec-item">
                        • {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Itens que Acompanham e Requisitos */}
                <div className="info-requisito-box">
                  <div className="requisito-linha">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      <strong>Requisito:</strong> {item.requisitosUso[0]}
                    </span>
                  </div>
                  <div className="requisito-linha">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>
                      <strong>Prazo Máximo:</strong> {item.tempoMaximoEmprestimo}
                    </span>
                  </div>
                </div>

                {/* Rodapé e Botão de Ação */}
                <div className="card-equipamento-rodape">
                  <button
                    type="button"
                    disabled={item.status !== 'disponivel'}
                    className={`btn btn-solicitar-hub ${
                      item.status === 'disponivel' ? 'btn-primario' : 'btn-bloqueado-hub'
                    }`}
                    onClick={() => {
                      setEquipamentoSelecionado(item)
                      setSolicitacaoConfirmada(null)
                    }}
                  >
                    {item.status === 'disponivel' ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Solicitar Empréstimo</span>
                      </>
                    ) : item.status === 'em_uso' ? (
                      'Em Uso no Momento'
                    ) : (
                      'Em Manutenção Técnica'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ============================================================
          CARD DE ORIENTAÇÕES DE GUARDA E TERMO DA MÚTUA-PI
          ============================================================ */}
      <section className="orientacoes-hub-card">
        <div className="orientacoes-icone-hub">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="orientacoes-conteudo-hub">
          <h4 className="orientacoes-titulo-hub">
            Regulamento de Empréstimo Tecnológico do Crea Tec HUB
          </h4>
          <p className="orientacoes-texto-hub">
            • O empréstimo é concedido exclusivamente a profissionais regularmente associados à Mútua-PI com anuidade em dia.<br />
            • A retirada e a devolução acontecem presencialmente no balcão da sede em Teresina-PI, com checklist físico de conferência de baterias, cabos e acessórios.<br />
            • O associado é o fiel depositário do bem durante todo o período, devendo comunicar imediatamente qualquer anormalidade técnica.
          </p>
        </div>
      </section>

      {/* ============================================================
          MODAL INTERATIVO DE SOLICITAÇÃO DE EMPRÉSTIMO
          ============================================================ */}
      {equipamentoSelecionado && (
        <div className="modal-hub-overlay" onClick={fecharModal}>
          <div
            className="modal-hub-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Cabeçalho do Modal */}
            <div className="modal-hub-cabecalho">
              <div>
                <span className="modal-hub-tag">Solicitação de Empréstimo Tecnológico</span>
                <h3 className="modal-hub-titulo">{equipamentoSelecionado.nome}</h3>
              </div>
              <button
                type="button"
                className="btn-fechar-hub-modal"
                onClick={fecharModal}
                aria-label="Fechar janela"
              >
                ✕
              </button>
            </div>

            {/* Sucesso após confirmação */}
            {solicitacaoConfirmada ? (
              <div className="modal-hub-sucesso-bloco">
                <div className="icone-sucesso-hub-animado">✓</div>
                <h4 className="sucesso-hub-titulo">Solicitação Registrada com Sucesso!</h4>
                <p className="sucesso-hub-mensagem">
                  Seu pedido de empréstimo foi recebido e aguarda retirada no balcão da Mútua-PI.
                </p>

                <div className="card-resumo-solicitacao">
                  <div className="linha-resumo-hub">
                    <span className="rotulo-resumo">Protocolo:</span>
                    <strong className="valor-resumo-protocolo">{solicitacaoConfirmada.protocolo}</strong>
                  </div>
                  <div className="linha-resumo-hub">
                    <span className="rotulo-resumo">Equipamento:</span>
                    <span>{solicitacaoConfirmada.equipamentoNome}</span>
                  </div>
                  <div className="linha-resumo-hub">
                    <span className="rotulo-resumo">Patrimônio:</span>
                    <strong>{solicitacaoConfirmada.patrimonio}</strong>
                  </div>
                  <div className="linha-resumo-hub">
                    <span className="rotulo-resumo">Período de Uso:</span>
                    <span>{solicitacaoConfirmada.periodo}</span>
                  </div>
                  <div className="linha-resumo-hub">
                    <span className="rotulo-resumo">Local de Retirada:</span>
                    <span>Balcão de Atendimento Mútua-PI • Sede Teresina</span>
                  </div>
                </div>

                <div className="sucesso-hub-acoes">
                  <button
                    type="button"
                    className="btn btn-primario"
                    onClick={() => navigate('/minhas-reservas')}
                  >
                    Ver Minhas Reservas
                  </button>
                  <button
                    type="button"
                    className="btn btn-secundario"
                    onClick={fecharModal}
                  >
                    Voltar ao Catálogo
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Solicitação */
              <form onSubmit={handleConfirmarSolicitacao} className="modal-hub-form">
                {/* Resumo do Aparelho */}
                <div className="modal-aparelho-resumo">
                  <div className="aparelho-resumo-dado">
                    <span className="dado-rotulo">Patrimônio:</span>
                    <strong className="dado-valor">{equipamentoSelecionado.patrimonio}</strong>
                  </div>
                  <div className="aparelho-resumo-divisor" />
                  <div className="aparelho-resumo-dado">
                    <span className="dado-rotulo">Prazo Máximo:</span>
                    <strong className="dado-valor">{equipamentoSelecionado.tempoMaximoEmprestimo}</strong>
                  </div>
                  <div className="aparelho-resumo-divisor" />
                  <div className="aparelho-resumo-dado">
                    <span className="dado-rotulo">Condição:</span>
                    <strong className="dado-valor">{equipamentoSelecionado.condicaoAtual}</strong>
                  </div>
                </div>

                {/* Período de Retirada */}
                <div className="grade-dupla-hub">
                  <div className="campo-grupo-hub">
                    <label htmlFor="data-retirada" className="campo-label-hub">
                      Data da Retirada *
                    </label>
                    <input
                      id="data-retirada"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={dataRetirada}
                      onChange={(e) => setDataRetirada(e.target.value)}
                      className="input-hub-padrao"
                    />
                  </div>

                  <div className="campo-grupo-hub">
                    <label htmlFor="horario-retirada" className="campo-label-hub">
                      Horário da Retirada *
                    </label>
                    <select
                      id="horario-retirada"
                      value={horarioRetirada}
                      onChange={(e) => setHorarioRetirada(e.target.value)}
                      className="input-hub-padrao"
                    >
                      <option value="08:30">08:30 (Abertura)</option>
                      <option value="10:00">10:00</option>
                      <option value="11:30">11:30</option>
                      <option value="14:00">14:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                </div>

                {/* Período de Devolução */}
                <div className="grade-dupla-hub">
                  <div className="campo-grupo-hub">
                    <label htmlFor="data-devolucao" className="campo-label-hub">
                      Data Prevista de Devolução *
                    </label>
                    <input
                      id="data-devolucao"
                      type="date"
                      required
                      min={dataRetirada}
                      value={dataDevolucao}
                      onChange={(e) => setDataDevolucao(e.target.value)}
                      className="input-hub-padrao"
                    />
                  </div>

                  <div className="campo-grupo-hub">
                    <label htmlFor="horario-devolucao" className="campo-label-hub">
                      Horário da Devolução *
                    </label>
                    <select
                      id="horario-devolucao"
                      value={horarioDevolucao}
                      onChange={(e) => setHorarioDevolucao(e.target.value)}
                      className="input-hub-padrao"
                    >
                      <option value="10:00">10:00</option>
                      <option value="12:00">12:00</option>
                      <option value="14:30">14:30</option>
                      <option value="17:00">17:00 (Fechamento)</option>
                    </select>
                  </div>
                </div>

                {/* Finalidade do Uso Técnico */}
                <div className="campo-grupo-hub">
                  <label htmlFor="finalidade-uso" className="campo-label-hub">
                    Finalidade Técnica / Descrição do Trabalho em Campo *
                  </label>
                  <input
                    id="finalidade-uso"
                    type="text"
                    required
                    placeholder="Ex: Levantamento topográfico para loteamento, laudo de termografia em subestação..."
                    value={finalidade}
                    onChange={(e) => setFinalidade(e.target.value)}
                    className="input-hub-padrao"
                  />
                </div>

                {/* Número da ART */}
                <div className="campo-grupo-hub">
                  <label htmlFor="numero-art" className="campo-label-hub">
                    Número da ART no CREA-PI (Anotação de Responsabilidade Técnica)
                  </label>
                  <input
                    id="numero-art"
                    type="text"
                    placeholder="Ex: PI20260012345 (Recomendado para obras e laudos)"
                    value={numeroArt}
                    onChange={(e) => setNumeroArt(e.target.value)}
                    className="input-hub-padrao"
                  />
                </div>

                {/* Itens que Acompanham */}
                <div className="itens-inclusos-box">
                  <span className="itens-inclusos-titulo">Itens que acompanham na maleta:</span>
                  <div className="itens-tags-lista">
                    {equipamentoSelecionado.itensInclusos.map((item, idx) => (
                      <span key={idx} className="item-tag-incluso">
                        📦 {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Termo de Cautela e Responsabilidade */}
                <label className="checkbox-termo-hub">
                  <input
                    type="checkbox"
                    checked={concordouTermo}
                    onChange={(e) => setConcordouTermo(e.target.checked)}
                    required
                  />
                  <span>
                    Assumo a responsabilidade pela guarda, integridade e conservação do equipamento
                    acima descrito, comprometendo-me a utilizá-lo estritamente no âmbito profissional e a
                    devolvê-lo na data aprazada no balcão da Mútua-PI.
                  </span>
                </label>

                {/* Botões de Ação */}
                <div className="modal-hub-acoes-rodape">
                  <button
                    type="button"
                    className="btn btn-cancelar-hub"
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !concordouTermo}
                    className="btn btn-primario btn-confirmar-hub"
                  >
                    {enviando ? 'Enviando solicitação...' : 'Confirmar Empréstimo HUB'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
