import { corresponde } from '../../utils/corresponde'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { consultarAmbientes, consultarEquipamentos, consultarReservas, linkRecurso } from '../../services/consultas'
import Icone from '../Icone'
import Janela from '../Janela'

export default function BuscaGlobal({ usuarioId }: { usuarioId: string }) {
  const [aberta, setAberta] = useState(false)
  const gatilho = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    function atalho(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!document.querySelector('dialog[open]')) setAberta(true)
      }
    }
    window.addEventListener('keydown', atalho)
    return () => window.removeEventListener('keydown', atalho)
  }, [])

  return <>
    <button className="busca-gatilho" ref={gatilho} type="button" onClick={() => setAberta(true)}
      aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" aria-label="Pesquisar no Mútua Tec Hub">
      <Icone nome="busca" /><span>Pesquisar</span><kbd>{/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'}</kbd>
    </button>
    {aberta && <Resultados usuarioId={usuarioId} fechar={() => {
      setAberta(false)
      requestAnimationFrame(() => gatilho.current?.focus())
    }} />}
  </>
}

function Resultados({ usuarioId, fechar }: { usuarioId: string; fechar: () => void }) {
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [indice, setIndice] = useState(-1)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => setTermo(busca.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [busca])
  const enabled = termo.length >= 2
  const ambientes = useQuery({ ...consultarAmbientes, enabled })
  const equipamentos = useQuery({ ...consultarEquipamentos, enabled })
  const reservas = useQuery({ ...consultarReservas(usuarioId), enabled })
  const categorias = [
    { nome: 'Ambientes', consulta: ambientes, itens: ambientes.data?.filter(a =>
      corresponde(termo, a.nome, a.tipo, a.descricao, a.localizacao, ...a.recursosDisponiveis))
      .map(a => ({ nome: a.nome, detalhe: a.localizacao, href: linkRecurso('ambientes', a.id) })) },
    { nome: 'Equipamentos', consulta: equipamentos, itens: equipamentos.data?.filter(e =>
      corresponde(termo, e.nome, e.categoria, e.patrimonio, e.descricao, ...e.especificacoes))
      .map(e => ({ nome: e.nome, detalhe: e.patrimonio, href: linkRecurso('equipamentos', e.id) })) },
    { nome: 'Minhas reservas', consulta: reservas, itens: reservas.data?.filter(r =>
      corresponde(termo, r.titulo, r.protocolo, r.localOuPatrimonio, r.finalidade))
      .map(r => ({ nome: r.titulo, detalhe: r.protocolo, href: `/minhas-reservas?id=${encodeURIComponent(r.id)}` })) },
  ]
  const atual = enabled && termo === busca.trim()
  const itens = atual ? categorias.flatMap(grupo => grupo.itens?.slice(0, 8) ?? []) : []
  const pendente = categorias.some(grupo => grupo.consulta.isPending)
  const erro = categorias.some(grupo => grupo.consulta.isError)

  function mover(proximo: number) {
    setIndice(proximo)
    document.getElementById(`busca-item-${proximo}`)?.scrollIntoView({ block: 'nearest' })
  }

  return <Janela fechar={fechar} titulo="Pesquisar no Mútua Tec Hub" className="janela-busca" focoInicial="#busca-global">
    <div className="janela-topo">
      <label htmlFor="busca-global">Pesquisar no Mútua Tec Hub</label>
      <button className="controle-icone" type="button" onClick={fechar} aria-label="Fechar busca"><Icone nome="fechar" /></button>
    </div>
    <input id="busca-global" className="controle-campo" type="search"
      placeholder="Nome, característica, patrimônio ou protocolo"
      value={busca} onChange={event => { setBusca(event.target.value); setIndice(-1) }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing) return
        if (event.key === 'Escape') {
          event.preventDefault()
          fechar()
          return
        }
        if (!itens.length) return
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          const direcao = event.key === 'ArrowDown' ? 1 : -1
          mover(indice < 0 ? (direcao === 1 ? 0 : itens.length - 1) : (indice + direcao + itens.length) % itens.length)
        }
        if (event.key === 'Enter') {
          const item = itens[indice >= 0 && indice < itens.length ? indice : 0]
          fechar()
          navigate(item.href)
        }
      }}
      role="combobox" aria-autocomplete="list" aria-expanded={itens.length > 0}
      aria-controls="resultados-busca" aria-activedescendant={itens[indice] ? `busca-item-${indice}` : undefined}
    />
    {busca.trim().length < 2 && <p className="texto-apoio">Digite pelo menos dois caracteres.</p>}
    {busca.trim().length >= 2 && (!atual || pendente) && <p role="status">Buscando…</p>}
    {atual && !pendente && !erro && itens.length === 0 && <p role="status">Nenhum resultado encontrado.</p>}
    {atual && categorias.filter(grupo => grupo.consulta.isError).map(grupo =>
      <p key={grupo.nome} role="alert">Falha ao consultar {grupo.nome.toLowerCase()}.{' '}
        <button type="button" onClick={() => void grupo.consulta.refetch()}>Tentar novamente</button></p>)}
    <div id="resultados-busca" role="listbox" aria-label="Resultados da pesquisa">
      {atual && categorias.map(grupo => Boolean(grupo.itens?.length) &&
        <div key={grupo.nome} role="group" aria-label={grupo.nome} className="busca-grupo">
          <h3 aria-hidden="true">{grupo.nome}</h3>
          {grupo.itens?.slice(0, 8).map(item => {
            const posicao = itens.indexOf(item)
            return <Link key={item.href} id={`busca-item-${posicao}`} role="option"
              aria-selected={posicao === indice} to={item.href} onClick={fechar}>
              <span>{item.nome}</span>{item.detalhe && <small>{item.detalhe}</small>}
            </Link>
          })}
        </div>)}
    </div>
  </Janela>
}
