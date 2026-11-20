import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Icone, { type NomeIcone } from '../../components/Icone'
import { useAuthStore } from '../../store/authStore'
import { consultarAmbientes, consultarEquipamentos, consultarReservas, linkRecurso, statusEquipamento, statusReserva } from '../../services/consultas'

const acoes: { titulo: string; descricao: string; rota: string; icone: NomeIcone }[] = [
  { titulo: 'Reservar ambiente', descricao: 'Salas, auditórios e coworking', rota: '/ambientes', icone: 'ambiente' },
  { titulo: 'Solicitar equipamento', descricao: 'Inventário do Crea Tec HUB', rota: '/equipamentos', icone: 'equipamento' },
  { titulo: 'Minhas reservas', descricao: 'Acompanhe seus pedidos', rota: '/minhas-reservas', icone: 'calendario' },
  { titulo: 'Consultar disponibilidade', descricao: 'Verifique os horários por data', rota: '/ambientes?modo=disponibilidade', icone: 'busca' },
]

export default function DashboardPage() {
  const usuario = useAuthStore(state => state.usuario)
  const reservas = useQuery(consultarReservas(usuario?.id ?? ''))
  const ambientes = useQuery(consultarAmbientes)
  const equipamentos = useQuery(consultarEquipamentos)
  const [agora] = useState(() => new Date())
  const hora = agora.getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const registros = reservas.data ?? []
  const pendentes = registros.filter(item => item.status === 'pendente').length
  const proximas = registros.filter(item => item.status === 'pendente' ||
    (item.status === 'confirmada' && new Date(item.dataFim) >= agora) || item.status === 'em_uso')
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio)).slice(0, 4)
  const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  const destaques = [
    ...(ambientes.data ?? []).slice(0, 2).map(item => ({
      id: item.id, nome: item.nome, detalhe: `${item.capacidade} pessoas`, tipo: 'ambientes' as const,
    })),
    ...(equipamentos.data ?? []).slice(0, 2).map(item => ({
      id: item.id, nome: item.nome, detalhe: statusEquipamento[item.status], tipo: 'equipamentos' as const,
    })),
  ]

  return <div className="painel-operacional">
    <header className="titulo-pagina">
      <p className="identificacao-pagina">PAINEL INICIAL</p>
      <h1>{saudacao}, {usuario?.nome}.</h1>
      <p>Agende espaços, solicite equipamentos e acompanhe suas reservas.</p>
    </header>
    <nav aria-label="Ações principais" className="acoes-dashboard">
      {acoes.map((acao, indice) => <Link className="acao-dashboard" to={acao.rota} key={acao.rota}>
        <span className="acao-icone"><Icone nome={acao.icone} /></span>
        <span><strong>{acao.titulo}</strong><small>{acao.descricao}</small></span>
        <Icone nome="seta" />
        {indice === 0 && <span className="acao-destaque" aria-hidden="true" />}
      </Link>)}
    </nav>
    <div className="resumo-dashboard">
      <section className="bloco-sigra" aria-labelledby="proximas-reservas">
        <h2 id="proximas-reservas">Próximas reservas</h2>
        {reservas.isPending && <p role="status">Carregando reservas…</p>}
        {reservas.isError && <p role="alert">Não foi possível consultar suas reservas.{' '}
          <button type="button" onClick={() => void reservas.refetch()}>Tentar novamente</button></p>}
        {reservas.isSuccess && proximas.length === 0 && <p className="texto-apoio">Você não tem reservas futuras ou solicitações em análise.</p>}
        <ul className="lista-dashboard">
          {proximas.map(item => <li key={item.id}><Link to={`/minhas-reservas?id=${encodeURIComponent(item.id)}`}>
            <span><strong>{item.titulo}</strong><small>{Number.isNaN(Date.parse(item.dataInicio)) ? item.protocolo : dataHora.format(new Date(item.dataInicio))}</small></span>
            <span className={`etiqueta-sigra etiqueta-${item.status}`}>{statusReserva[item.status]}</span>
          </Link></li>)}
        </ul>
        {reservas.isSuccess && pendentes > 0 && <p className="texto-apoio resumo-pendentes">{pendentes} em análise</p>}
      </section>
      <section className="bloco-sigra" aria-labelledby="destaques-reservas">
        <h2 id="destaques-reservas">Recursos em destaque</h2>
        {(ambientes.isPending || equipamentos.isPending) && <p role="status">Carregando recursos…</p>}
        {(ambientes.isError || equipamentos.isError) && <p role="alert">Parte do catálogo está indisponível.{' '}
          <button type="button" onClick={() => {
            if (ambientes.isError) void ambientes.refetch()
            if (equipamentos.isError) void equipamentos.refetch()
          }}>Tentar novamente</button></p>}
        {ambientes.isSuccess && equipamentos.isSuccess && destaques.length === 0 && <p className="texto-apoio">Nenhum recurso ativo no catálogo.</p>}
        <ul className="lista-dashboard">
          {destaques.map(item => <li key={item.id}><Link to={linkRecurso(item.tipo, item.id)}>
            <span className="acao-icone"><Icone nome={item.tipo === 'ambientes' ? 'ambiente' : 'equipamento'} /></span>
            <span><strong>{item.nome}</strong><small>{item.detalhe}</small></span>
            <Icone nome="seta" />
          </Link></li>)}
        </ul>
      </section>
    </div>
  </div>
}
