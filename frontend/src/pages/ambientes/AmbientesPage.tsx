import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AMBIENTES_INICIAIS, ambienteService } from '../../services/ambienteService'
import './Ambientes.css'

type AmbienteCompleto = (typeof AMBIENTES_INICIAIS)[0]

export default function AmbientesPage() {
  const navigate = useNavigate()

  // Estados de filtro
  const [termoBusca, setTermoBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [capacidadeFiltro, setCapacidadeFiltro] = useState<number>(0)

  // Estados do modal de reserva
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<AmbienteCompleto | null>(null)
  const [dataReserva, setDataReserva] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  )
  const [horarioInicio, setHorarioInicio] = useState('14:00')
  const [horarioFim, setHorarioFim] = useState('16:00')
  const [finalidade, setFinalidade] = useState('')
  const [quantidadePessoas, setQuantidadePessoas] = useState<number>(2)
  const [concordouRegras, setConcordouRegras] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [reservaConfirmada, setReservaConfirmada] = useState<{
    protocolo: string
    ambienteNome: string
    data: string
    horario: string
  } | null>(null)

  // Filtragem dos ambientes em tempo real
  const ambientesFiltrados = useMemo(() => {
    return AMBIENTES_INICIAIS.filter((item) => {
      // Filtro de tipo
      if (tipoFiltro !== 'todos' && item.tipo !== tipoFiltro) return false

      // Filtro de capacidade
      if (capacidadeFiltro > 0 && item.capacidade < capacidadeFiltro) return false

      // Filtro de busca
      if (termoBusca.trim()) {
        const termo = termoBusca.toLowerCase()
        const bateuNome = item.nome.toLowerCase().includes(termo)
        const bateuDesc = item.descricao ? item.descricao.toLowerCase().includes(termo) : false
        const bateuRecurso = item.recursos.some((r) => r.toLowerCase().includes(termo))
        const bateuLocal = item.localizacao.toLowerCase().includes(termo)
        if (!bateuNome && !bateuDesc && !bateuRecurso && !bateuLocal) return false
      }

      return true
    })
  }, [tipoFiltro, capacidadeFiltro, termoBusca])

  // Submissão da reserva
  const handleConfirmarReserva = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ambienteSelecionado) return

    setEnviando(true)

    try {
      await ambienteService.reservar({
        ambienteId: ambienteSelecionado.id,
        data: dataReserva,
        horarioInicio,
        horarioFim,
        finalidade: finalidade.trim() || 'Reunião profissional de engenharia/agronomia',
        quantidadePessoas,
      })

      const protocoloGerado =
        'MUT-' +
        new Date().getFullYear() +
        '-' +
        Math.floor(1000 + Math.random() * 9000)

      setReservaConfirmada({
        protocolo: protocoloGerado,
        ambienteNome: ambienteSelecionado.nome,
        data: new Date(dataReserva + 'T12:00:00').toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        horario: `${horarioInicio} às ${horarioFim}`,
      })
    } catch {
      alert('Não foi possível registrar a reserva no momento.')
    } finally {
      setEnviando(false)
    }
  }

  const fecharModal = () => {
    setAmbienteSelecionado(null)
    setReservaConfirmada(null)
    setFinalidade('')
  }

  return (
    <div className="ambientes-page-container">
      {/* ============================================================
          CABEÇALHO DA PÁGINA
          ============================================================ */}
      <header className="ambientes-cabecalho">
        <div>
          <div className="badge-localizacao-sede">
            <span className="ponto-status-sede" />
            <span>Sede Mútua-PI • Teresina-PI</span>
          </div>
          <h1 className="ambientes-titulo">Espaços e Salas para Associados</h1>
          <p className="ambientes-subtitulo">
            Coworking gratuito com internet de alta velocidade, salas de reuniões privativas e
            auditório com estrutura audiovisual de ponta.
          </p>
        </div>

        <div className="resumo-ocupacao-bloco">
          <div className="bloco-dado">
            <span className="bloco-valor">{AMBIENTES_INICIAIS.length}</span>
            <span className="bloco-rotulo">Espaços Totais</span>
          </div>
          <div className="bloco-divisor" />
          <div className="bloco-dado">
            <span className="bloco-valor destaque-verde">4 Livres</span>
            <span className="bloco-rotulo">Hoje</span>
          </div>
        </div>
      </header>

      {/* ============================================================
          BARRA DE PESQUISA E FILTROS DINÂMICOS
          ============================================================ */}
      <section className="barra-filtros-container">
        {/* Campo de Busca Rápida */}
        <div className="busca-ambientes-wrapper">
          <span className="icone-lupa">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por sala, recurso (Wi-Fi, 4K, projetor, acústica)..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="input-busca-ambientes"
          />
          {termoBusca && (
            <button
              type="button"
              className="btn-limpar-busca"
              onClick={() => setTermoBusca('')}
              title="Limpar pesquisa"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filtros-linha-botoes">
          {/* Pílulas de Tipo de Espaço */}
          <div className="grupo-pilulas-tipo">
            <button
              type="button"
              className={`pilula-filtro ${tipoFiltro === 'todos' ? 'pilula-ativa' : ''}`}
              onClick={() => setTipoFiltro('todos')}
            >
              Todos os Espaços ({AMBIENTES_INICIAIS.length})
            </button>
            <button
              type="button"
              className={`pilula-filtro ${tipoFiltro === 'coworking' ? 'pilula-ativa' : ''}`}
              onClick={() => setTipoFiltro('coworking')}
            >
              💻 Coworking
            </button>
            <button
              type="button"
              className={`pilula-filtro ${tipoFiltro === 'sala_reuniao' ? 'pilula-ativa' : ''}`}
              onClick={() => setTipoFiltro('sala_reuniao')}
            >
              🤝 Salas de Reunião
            </button>
            <button
              type="button"
              className={`pilula-filtro ${tipoFiltro === 'sala_multiuso' ? 'pilula-ativa' : ''}`}
              onClick={() => setTipoFiltro('sala_multiuso')}
            >
              📚 Treinamentos & Multiuso
            </button>
            <button
              type="button"
              className={`pilula-filtro ${tipoFiltro === 'auditorio' ? 'pilula-ativa' : ''}`}
              onClick={() => setTipoFiltro('auditorio')}
            >
              🎙️ Auditório
            </button>
          </div>

          {/* Filtro de Capacidade */}
          <div className="seletor-capacidade-wrapper">
            <label htmlFor="filtro-capacidade" className="label-filtro-capacidade">
              Capacidade mínima:
            </label>
            <select
              id="filtro-capacidade"
              value={capacidadeFiltro}
              onChange={(e) => setCapacidadeFiltro(Number(e.target.value))}
              className="select-capacidade"
            >
              <option value="0">Qualquer tamanho</option>
              <option value="6">Até 6 pessoas</option>
              <option value="8">8 ou mais pessoas</option>
              <option value="16">16 ou mais pessoas</option>
              <option value="50">50 ou mais pessoas</option>
            </select>
          </div>
        </div>
      </section>

      {/* ============================================================
          CATÁLOGO DE CARDS DOS AMBIENTES
          ============================================================ */}
      <section className="grid-ambientes-cards">
        {ambientesFiltrados.length === 0 ? (
          <div className="empty-state-ambientes">
            <span className="empty-icone">🔍</span>
            <h3 className="empty-titulo">Nenhum espaço encontrado</h3>
            <p className="empty-desc">
              Não encontramos nenhum ambiente com os filtros selecionados. Tente ajustar o termo de
              pesquisa ou a capacidade.
            </p>
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => {
                setTermoBusca('')
                setTipoFiltro('todos')
                setCapacidadeFiltro(0)
              }}
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : (
          ambientesFiltrados.map((ambiente) => (
            <div key={ambiente.id} className="card-ambiente-detalhado">
              {/* Header do Card com Banner e Capacidade */}
              <div className="banner-ambiente-cabecalho" data-tipo={ambiente.tipo}>
                <div className="badge-capacidade-flutuante">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Até {ambiente.capacidade} pessoas</span>
                </div>

                <div className="badge-status-disponivel">
                  <span className="ponto-verde" />
                  <span>Disponível</span>
                </div>

                <div className="simbolo-tipo-ilustracao">
                  {ambiente.tipo === 'coworking' && '💻'}
                  {ambiente.tipo === 'sala_reuniao' && '🤝'}
                  {ambiente.tipo === 'sala_multiuso' && '📚'}
                  {ambiente.tipo === 'auditorio' && '🎙️'}
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="card-ambiente-corpo">
                <div className="ambiente-localizacao-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{ambiente.localizacao}</span>
                </div>

                <h2 className="ambiente-card-nome">{ambiente.nome}</h2>
                <p className="ambiente-card-descricao">{ambiente.descricao}</p>

                {/* Comodidades e Recursos */}
                <div className="bloco-recursos-ambiente">
                  <span className="recursos-titulo-rotulo">Recursos disponíveis:</span>
                  <div className="lista-tags-recursos">
                    {ambiente.recursos.map((rec, idx) => (
                      <span key={idx} className="tag-recurso-item">
                        ✓ {rec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Regras e Horário */}
                <div className="ambiente-regras-bloco">
                  <div className="regras-linha">
                    <span className="regras-rotulo">Funcionamento:</span>
                    <span className="regras-valor">{ambiente.horarioFuncionamento}</span>
                  </div>
                </div>

                {/* Rodapé e Botão de Ação */}
                <div className="card-ambiente-rodape">
                  <button
                    type="button"
                    className="btn btn-primario btn-reservar-sala"
                    onClick={() => {
                      setAmbienteSelecionado(ambiente)
                      setReservaConfirmada(null)
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Agendar Este Espaço</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ============================================================
          MODAL INTERATIVO DE AGENDAMENTO DE RESERVA
          ============================================================ */}
      {ambienteSelecionado && (
        <div className="modal-reserva-overlay" onClick={fecharModal}>
          <div
            className="modal-reserva-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Cabeçalho do Modal */}
            <div className="modal-cabecalho">
              <div>
                <span className="modal-subtitulo-tag">Reserva de Espaço Físico</span>
                <h3 className="modal-titulo">{ambienteSelecionado.nome}</h3>
              </div>
              <button
                type="button"
                className="btn-fechar-modal"
                onClick={fecharModal}
                aria-label="Fechar janela"
              >
                ✕
              </button>
            </div>

            {/* Sucesso após confirmação */}
            {reservaConfirmada ? (
              <div className="modal-sucesso-bloco">
                <div className="icone-sucesso-animado">✓</div>
                <h4 className="sucesso-titulo">Reserva Confirmada com Sucesso!</h4>
                <p className="sucesso-mensagem">
                  Seu espaço foi agendado e reservado na sede da Mútua-PI.
                </p>

                <div className="card-resumo-confirmacao">
                  <div className="linha-confirmacao">
                    <span className="rotulo-conf">Protocolo:</span>
                    <strong className="valor-conf-protocolo">{reservaConfirmada.protocolo}</strong>
                  </div>
                  <div className="linha-confirmacao">
                    <span className="rotulo-conf">Espaço:</span>
                    <span>{reservaConfirmada.ambienteNome}</span>
                  </div>
                  <div className="linha-confirmacao">
                    <span className="rotulo-conf">Data:</span>
                    <span>{reservaConfirmada.data}</span>
                  </div>
                  <div className="linha-confirmacao">
                    <span className="rotulo-conf">Horário:</span>
                    <span>{reservaConfirmada.horario}</span>
                  </div>
                  <div className="linha-confirmacao">
                    <span className="rotulo-conf">Local:</span>
                    <span>{ambienteSelecionado.localizacao}</span>
                  </div>
                </div>

                <div className="sucesso-botoes">
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
                    Agendar Outro Espaço
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Reserva */
              <form onSubmit={handleConfirmarReserva} className="modal-form-corpo">
                <div className="modal-ambiente-info-resumo">
                  <div className="info-miniatura-item">
                    <span>Capacidade:</span>
                    <strong>Até {ambienteSelecionado.capacidade} pessoas</strong>
                  </div>
                  <div className="info-miniatura-divisor" />
                  <div className="info-miniatura-item">
                    <span>Localização:</span>
                    <strong>{ambienteSelecionado.localizacao}</strong>
                  </div>
                </div>

                {/* Seleção de Data */}
                <div className="campo-form-grupo">
                  <label htmlFor="data-reserva" className="campo-label">
                    Data da Reserva *
                  </label>
                  <input
                    id="data-reserva"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={dataReserva}
                    onChange={(e) => setDataReserva(e.target.value)}
                    className="input-modal-padrao"
                  />
                  <div className="atalhos-data-rapida">
                    <button
                      type="button"
                      className="btn-atalho-data"
                      onClick={() => setDataReserva(new Date().toISOString().split('T')[0])}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      className="btn-atalho-data"
                      onClick={() =>
                        setDataReserva(
                          new Date(Date.now() + 86400000).toISOString().split('T')[0]
                        )
                      }
                    >
                      Amanhã
                    </button>
                  </div>
                </div>

                {/* Horários */}
                <div className="grade-dois-campos">
                  <div className="campo-form-grupo">
                    <label htmlFor="horario-inicio" className="campo-label">
                      Horário Inicial *
                    </label>
                    <select
                      id="horario-inicio"
                      value={horarioInicio}
                      onChange={(e) => setHorarioInicio(e.target.value)}
                      className="input-modal-padrao"
                    >
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>

                  <div className="campo-form-grupo">
                    <label htmlFor="horario-fim" className="campo-label">
                      Horário Término *
                    </label>
                    <select
                      id="horario-fim"
                      value={horarioFim}
                      onChange={(e) => setHorarioFim(e.target.value)}
                      className="input-modal-padrao"
                    >
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                    </select>
                  </div>
                </div>

                {/* Finalidade do Uso */}
                <div className="campo-form-grupo">
                  <label htmlFor="finalidade-reuniao" className="campo-label">
                    Finalidade da Reunião / Uso *
                  </label>
                  <input
                    id="finalidade-reuniao"
                    type="text"
                    required
                    placeholder="Ex: Alinhamento de projeto com cliente, reunião de conselho..."
                    value={finalidade}
                    onChange={(e) => setFinalidade(e.target.value)}
                    className="input-modal-padrao"
                  />
                </div>

                {/* Quantidade de Participantes */}
                <div className="campo-form-grupo">
                  <label htmlFor="qtd-participantes" className="campo-label">
                    Previsão de Participantes (Máx: {ambienteSelecionado.capacidade})
                  </label>
                  <input
                    id="qtd-participantes"
                    type="number"
                    min="1"
                    max={ambienteSelecionado.capacidade}
                    value={quantidadePessoas}
                    onChange={(e) => setQuantidadePessoas(Number(e.target.value))}
                    className="input-modal-padrao"
                  />
                </div>

                {/* Termos de Uso */}
                <label className="checkbox-termo-label">
                  <input
                    type="checkbox"
                    checked={concordouRegras}
                    onChange={(e) => setConcordouRegras(e.target.checked)}
                    required
                  />
                  <span>
                    Declaro estar ciente das normas de uso da Mútua-PI, zelando pela preservação das
                    instalações e pontualidade na desocupação.
                  </span>
                </label>

                {/* Ações do Modal */}
                <div className="modal-acoes-rodape">
                  <button
                    type="button"
                    className="btn btn-cancelar-modal"
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !concordouRegras}
                    className="btn btn-primario btn-confirmar-modal"
                  >
                    {enviando ? 'Processando reserva...' : 'Confirmar Reserva de Sala'}
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
