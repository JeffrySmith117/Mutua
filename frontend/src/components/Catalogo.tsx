import { corresponde } from '../utils/corresponde'
import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { consultarAmbientes, consultarEquipamentos, statusEquipamento } from '../services/consultas'
import { ambienteService, type AmbienteCompleto, type RespostaReservaCriada } from '../services/ambienteService'
import { equipamentoService, type EquipamentoCompleto } from '../services/equipamentoService'
import { diaDaSemana, obterDataHojeLocal, proximaDataDeFuncionamento } from '../utils/dataLocal'
import { extrairMensagemErro } from '../utils/erroApi'
import Disponibilidade from './Disponibilidade'
import Icone from './Icone'
import Janela from './Janela'

type Recurso = AmbienteCompleto | EquipamentoCompleto
const tipos = { coworking: 'Coworking', sala: 'Sala', auditorio: 'Auditório' }

function ehEquipamento(recurso: Recurso): recurso is EquipamentoCompleto {
  return 'patrimonio' in recurso
}

function metadados(recurso: Recurso) {
  return ehEquipamento(recurso)
    ? [recurso.categoria, recurso.patrimonio, statusEquipamento[recurso.status]]
    : [tipos[recurso.tipo], `${recurso.capacidade} pessoas`, recurso.localizacao]
}

export default function Catalogo({ catalogo }: { catalogo: 'ambientes' | 'equipamentos' }) {
  const equipamentos = catalogo === 'equipamentos'
  const ambientesQuery = useQuery({ ...consultarAmbientes, enabled: !equipamentos, staleTime: 0 })
  const equipamentosQuery = useQuery({ ...consultarEquipamentos, enabled: equipamentos, staleTime: 0 })
  const consulta = equipamentos ? equipamentosQuery : ambientesQuery
  const [parametros, definirParametros] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [filtro, setFiltro] = useState('')
  const disponibilidade = parametros.get('modo') === 'disponibilidade'
  const id = parametros.get('id')

  const recursos: Recurso[] = consulta.data ?? []
  const categorias = equipamentos
    ? [...new Set(equipamentosQuery.data?.map(item => item.categoria).filter(Boolean))].sort()
    : Object.values(tipos)
  const selecionado = recursos.find(recurso => recurso.id === id)
  const filtrados = recursos.filter(recurso => {
    const dados = metadados(recurso)
    const especificacoes = ehEquipamento(recurso) ? recurso.especificacoes : recurso.recursosDisponiveis
    const atendeFiltro = !filtro || (ehEquipamento(recurso) ? recurso.status === filtro : recurso.capacidade >= Number(filtro))
    return (!categoria || dados[0] === categoria) && atendeFiltro &&
      corresponde(busca, recurso.nome, recurso.descricao, ...dados, ...especificacoes)
  })

  function selecionar(recursoId?: string) {
    const novos = new URLSearchParams(parametros)
    if (recursoId) novos.set('id', recursoId)
    else novos.delete('id')
    definirParametros(novos, { replace: !recursoId })
  }

  return <div className="pagina-catalogo">
    <header className="titulo-pagina">
      <h1>{disponibilidade ? 'Consultar disponibilidade' : equipamentos ? 'Equipamentos HUB' : 'Ambientes e Coworking'}</h1>
      <p>{disponibilidade ? 'Escolha um recurso e uma data para consultar os horários ocupados.' :
        equipamentos ? 'Encontre um equipamento e consulte o período de empréstimo.' :
          'Escolha um espaço e consulte os horários antes de reservar.'}</p>
      {disponibilidade && <nav className="alternar-catalogo" aria-label="Tipo de recurso">
        <Link aria-current={!equipamentos ? 'page' : undefined} to="/ambientes?modo=disponibilidade">Ambientes</Link>
        <Link aria-current={equipamentos ? 'page' : undefined} to="/equipamentos?modo=disponibilidade">Equipamentos</Link>
      </nav>}
    </header>
    <div className="filtros-catalogo">
      <label>Pesquisar <input className="controle-campo" type="search" value={busca} onChange={e => setBusca(e.target.value)}
        placeholder={equipamentos ? 'Nome ou patrimônio' : 'Nome ou característica'} /></label>
      <label>{equipamentos ? 'Categoria' : 'Tipo'} <select className="controle-campo" value={categoria} onChange={e => setCategoria(e.target.value)}>
        <option value="">Todas as opções</option>{categorias.map(valor => <option key={valor}>{valor}</option>)}
      </select></label>
      <label>{equipamentos ? 'Status' : 'Capacidade mínima'} <select className="controle-campo" value={filtro} onChange={e => setFiltro(e.target.value)}>
        <option value="">Todas as opções</option>
        {equipamentos ? Object.entries(statusEquipamento).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>) :
          [4, 8, 12, 20, 40].map(valor => <option key={valor} value={valor}>{valor} pessoas</option>)}
      </select></label>
    </div>
    {consulta.isPending ? <p role="status">Carregando catálogo…</p> :
      consulta.isError ? <div className="bloco-sigra" role="alert">
        <p>Não foi possível carregar o catálogo.</p>
        <button type="button" className="btn btn-secundario" onClick={() => void consulta.refetch()}>Tentar novamente</button>
      </div> : <>
        {id && !selecionado && <p role="status">O recurso selecionado não está no catálogo ativo.</p>}
        <p className="texto-apoio" role="status">{filtrados.length} {filtrados.length === 1 ? 'recurso encontrado' : 'recursos encontrados'}</p>
        {filtrados.length === 0 && <div className="bloco-sigra">
          <p>{recursos.length ? 'Nenhum recurso corresponde aos filtros.' : 'Nenhum recurso cadastrado neste catálogo.'}</p>
          {(busca || filtro || categoria) && <button className="btn btn-secundario" type="button" onClick={() => {
            setBusca(''); setCategoria(''); setFiltro('')
          }}>Limpar filtros</button>}
        </div>}
        <div className="grade-catalogo">
          {filtrados.map(recurso => <article key={recurso.id} className="catalogo-card">
            <div className="catalogo-imagem">
              <Icone nome={equipamentos ? 'equipamento' : 'ambiente'} />
              {recurso.imagens?.[0] && <img src={recurso.imagens[0]} alt="" loading="lazy"
                onError={event => { event.currentTarget.hidden = true }} />}
            </div>
            <div className="catalogo-card-corpo">
              <div className="catalogo-meta">{metadados(recurso).filter(Boolean).map((valor, i) => <span key={i}>{valor}</span>)}</div>
              <h2>{recurso.nome}</h2>
              {recurso.descricao && <p>{recurso.descricao}</p>}
              <button type="button" className="btn btn-secundario" onClick={() => selecionar(recurso.id)}
                aria-label={`Ver horários para ${recurso.nome}`}>Ver horários <Icone nome="seta" /></button>
            </div>
          </article>)}
        </div>
      </>}
    {selecionado && <ReservaRecurso key={selecionado.id} recurso={selecionado} fechar={() => selecionar()} />}
  </div>
}

function ReservaRecurso({ recurso, fechar }: { recurso: Recurso; fechar: () => void }) {
  const equipamento = ehEquipamento(recurso) ? recurso : null
  const ambiente = ehEquipamento(recurso) ? null : recurso
  const catalogo = equipamento ? 'equipamentos' : 'ambientes'
  const [inicio, setInicio] = useState(() => proximaDataDeFuncionamento(recurso.diasSemana))
  const [fim, setFim] = useState(inicio)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<RespostaReservaCriada>()
  const queryClient = useQueryClient()
  const detalhes = equipamento?.especificacoes ?? ambiente?.recursosDisponiveis ?? []

  const diaFechado = (data: string) => Boolean(data && recurso.diasSemana?.length &&
    !recurso.diasSemana.includes(diaDaSemana(data)))
  const inicioFechado = diaFechado(inicio)
  const fimFechado = Boolean(equipamento && diaFechado(fim))
  const abertura = recurso.horarioAbertura?.slice(0, 5)
  const fechamento = recurso.horarioFechamento?.slice(0, 5)

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando) return
    const campos = new FormData(event.currentTarget)
    const horarioInicio = String(campos.get('hora-inicio'))
    const horarioFim = String(campos.get('hora-fim'))
    const finalidade = String(campos.get('finalidade')).trim()
    if (!finalidade) { setErro('Informe a finalidade.'); return }
    if (`${inicio}T${horarioInicio}` >= `${equipamento ? fim : inicio}T${horarioFim}`) {
      setErro('O término deve ser posterior ao início.')
      return
    }
    if (inicioFechado || fimFechado) {
      setErro('Escolha datas em que o recurso funciona.')
      return
    }
    setErro('')
    setEnviando(true)
    try {
      const mensagem = equipamento
        ? await equipamentoService.solicitarEmprestimo({
          equipamentoId: equipamento.id, dataRetirada: inicio, horarioRetirada: horarioInicio,
          dataDevolucao: fim, horarioDevolucao: horarioFim, finalidade,
          numeroArt: String(campos.get('art') ?? '').trim() || undefined,
          termoAceito: campos.has('aceite'),
        })
        : await ambienteService.reservar({
          ambienteId: recurso.id, data: inicio, horarioInicio, horarioFim, finalidade,
          quantidadePessoas: Number(campos.get('quantidade')),
        })
      setResultado(mensagem)
      void queryClient.invalidateQueries({ queryKey: ['minhas-reservas'] })
      void queryClient.invalidateQueries({ queryKey: ['disponibilidade', catalogo, recurso.id] })
    } catch (falha) {
      setErro(extrairMensagemErro(falha, 'Não foi possível registrar a solicitação.'))
    } finally {
      setEnviando(false)
    }
  }

  return <Janela fechar={() => { if (!enviando) fechar() }} titulo={recurso.nome}>
    <div className="janela-topo"><h2>{recurso.nome}</h2>
      <button className="controle-icone" type="button" onClick={fechar} disabled={enviando}
        aria-label="Fechar detalhes"><Icone nome="fechar" /></button>
    </div>
    {resultado ? <div className="consulta-disponibilidade" role="status">
      <h3>{resultado.status?.toLowerCase() === 'pendente' ? 'Solicitação em análise' : 'Registro efetuado'}</h3>
      {resultado.mensagem && <p>{resultado.mensagem}</p>}
      {resultado.protocolo && <p>Protocolo <strong>{resultado.protocolo}</strong></p>}
      <Link className="btn btn-primario" to={`/minhas-reservas?id=${encodeURIComponent(resultado.id)}`}>Acompanhar registro</Link>
    </div> : <>
      {recurso.descricao && <p className="texto-apoio">{recurso.descricao}</p>}
      <div className="catalogo-meta">{metadados(recurso).filter(Boolean).map((valor, i) => <span key={i}>{valor}</span>)}</div>
      {detalhes.length > 0 && <details className="detalhes-catalogo"><summary>{equipamento ? 'Especificações' : 'Recursos do ambiente'}</summary>
        <ul>{detalhes.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </details>}
      {recurso.horarioFuncionamento && <p>Funcionamento: {recurso.horarioFuncionamento}</p>}
      {equipamento && equipamento.prazoMaximoDias > 0 && <p>Prazo máximo informado: {equipamento.prazoMaximoDias} dias.</p>}
      {recurso.exigeAprovacao && <p>O pedido será enviado para análise.</p>}
      <form className="formulario-recurso" onSubmit={enviar} aria-busy={enviando}>
        <div className="grade-formulario">
          <label>{equipamento ? 'Data de retirada' : 'Data da reserva'}
            <input className="controle-campo" type="date" min={obterDataHojeLocal()} required value={inicio}
              onChange={event => {
                const valor = event.target.value
                setInicio(valor)
                if (valor > fim) setFim(valor)
              }} /></label>
          {equipamento && <label>Data de devolução
            <input className="controle-campo" type="date" min={inicio} required value={fim} onChange={event => setFim(event.target.value)} />
          </label>}
        </div>
        {inicioFechado ? <p className="erro-sigra" role="status">{equipamento ? 'Sem atendimento na data de retirada.' : 'O ambiente está fechado nessa data.'}</p> :
          <Disponibilidade catalogo={catalogo} id={recurso.id} data={inicio} titulo={equipamento ? 'Disponibilidade na retirada' : undefined} />}
        {equipamento && fim !== inicio && (fimFechado ?
          <p className="erro-sigra" role="status">Sem atendimento na data de devolução.</p> :
          <Disponibilidade catalogo={catalogo} id={recurso.id} data={fim} titulo="Disponibilidade na devolução" />)}
        {equipamento && fim !== inicio && <p className="texto-apoio">O sistema verifica o período completo ao receber a solicitação.</p>}
        <div className="grade-formulario">
          <label>{equipamento ? 'Horário de retirada' : 'Horário de início'}
            <input className="controle-campo" type="time" name="hora-inicio" min={abertura} max={fechamento} required /></label>
          <label>{equipamento ? 'Horário de devolução' : 'Horário de término'}
            <input className="controle-campo" type="time" name="hora-fim" min={abertura} max={fechamento} required /></label>
        </div>
        <label>Finalidade <textarea className="controle-campo" name="finalidade" required maxLength={1000} rows={2} /></label>
        {ambiente && <label>Quantidade de pessoas <input className="controle-campo" type="number" name="quantidade"
          min={1} max={ambiente.capacidade || undefined} required defaultValue={1} /></label>}
        {equipamento && <label>Número da ART {equipamento.exigeArtSisAnt ? '' : '(opcional)'}
          <input className="controle-campo" name="art" required={equipamento.exigeArtSisAnt} maxLength={175} /></label>}
        <label className="aceite-recurso"><input type="checkbox" name="aceite" required />{equipamento ?
          'Comprometo-me a guardar e devolver o equipamento no período solicitado.' :
          'Comprometo-me a respeitar os horários e as regras do ambiente.'}</label>
        {erro && <p className="erro-sigra" role="alert">{erro}</p>}
        <button type="submit" className="btn btn-primario" disabled={enviando || inicioFechado || fimFechado}>
          {enviando ? 'Enviando…' : equipamento ? 'Solicitar equipamento' : 'Reservar ambiente'}
        </button>
      </form>
    </>}
  </Janela>
}
