import { useState, useRef } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import Icone, { type NomeIcone } from '../Icone'
import Janela from '../Janela'
import Marca from '../Marca'
import BuscaGlobal from './BuscaGlobal'
import './PainelLayout.css'

const itens: { rota: string; nome: string; icone: NomeIcone }[] = [
  { rota: '/', nome: 'Visão geral', icone: 'painel' },
  { rota: '/ambientes', nome: 'Ambientes e coworking', icone: 'ambiente' },
  { rota: '/equipamentos', nome: 'Equipamentos', icone: 'equipamento' },
  { rota: '/minhas-reservas', nome: 'Minhas reservas', icone: 'calendario' },
]

export default function PainelLayout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [recolhido, setRecolhido] = useState(false)
  const perfilRef = useRef<HTMLDetailsElement>(null)
  const { usuario, sair } = useAuthStore()
  const { tema, alternarTema } = useThemeStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (!usuario) return <Navigate to="/entrar" replace />
  const ehAdmin = usuario.perfil.toLowerCase() === 'admin'
  const iniciais = usuario.nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()

  function links(mobile: boolean) {
    return <nav aria-label="Navegação principal">
      {itens.map(({ rota, nome, icone }) =>
        <NavLink end={rota === '/'} key={rota} to={rota} title={!mobile && recolhido ? nome : undefined}
          aria-label={nome} onClick={() => setMenuAberto(false)}>
          <Icone nome={icone} /><span>{nome}</span>
        </NavLink>)}
      {ehAdmin && <div className="navegacao-admin">
        <NavLink to="/admin" aria-label="Administração" title={!mobile && recolhido ? 'Administração' : undefined} onClick={() => setMenuAberto(false)}>
          <Icone nome="admin" /><span>Administração</span>
        </NavLink>
      </div>}
    </nav>
  }

  return <div className={`estrutura-sigra ${recolhido ? 'estrutura-recolhida' : ''}`}>
    <a className="pular-navegacao" href="#conteudo-principal">Ir para o conteúdo</a>
    <aside className="navegacao-desktop">
      <Marca compacta={recolhido} />
      {links(false)}
      <button type="button" className="controle-icone recolher-menu" aria-pressed={recolhido}
        aria-label={recolhido ? 'Expandir navegação' : 'Recolher navegação'}
        title={recolhido ? 'Expandir navegação' : 'Recolher navegação'}
        onClick={() => setRecolhido(!recolhido)}><Icone nome="recolher" /></button>
    </aside>
    {menuAberto && <Janela fechar={() => setMenuAberto(false)} titulo="Menu do Mútua Tec Hub" className="navegacao-mobile">
      <div className="janela-topo"><Marca />
        <button type="button" className="controle-icone" onClick={() => setMenuAberto(false)} aria-label="Fechar navegação"><Icone nome="fechar" /></button>
      </div>
      {links(true)}
    </Janela>}
    <div className="corpo-sigra">
      <header className="barra-sigra" onPointerDown={event => {
        if (!perfilRef.current?.contains(event.target as Node)) perfilRef.current?.removeAttribute('open')
      }}>
        <button type="button" className="controle-icone abrir-menu" onClick={() => setMenuAberto(true)}
          aria-label="Abrir navegação" aria-haspopup="dialog"><Icone nome="menu" /></button>
        <BuscaGlobal usuarioId={usuario.id} />
        <button type="button" className="controle-icone controle-tema" onClick={alternarTema}
          aria-pressed={tema === 'escuro'} aria-label="Tema escuro" title={tema === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'}>
          <Icone nome={tema === 'escuro' ? 'sol' : 'lua'} />
        </button>
        <details className="perfil-sigra" ref={perfilRef} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false
        }} onKeyDown={event => {
          if (event.key === 'Escape' && event.currentTarget.open) {
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}>
          <summary>
            <span className="sr-only">Conta de usuário</span>
            <span className="perfil-iniciais" aria-hidden="true">{iniciais}</span>
            <strong>{usuario.nome}</strong>
          </summary>
          <div className="perfil-opcoes">
            <strong>{usuario.nome}</strong><small>{usuario.email}</small>
            <button className="btn btn-secundario" type="button" onClick={() => {
              sair()
              queryClient.clear()
              navigate('/entrar', { replace: true })
            }}>Encerrar sessão</button>
          </div>
        </details>
      </header>
      <main className="conteudo-sigra" id="conteudo-principal" tabIndex={-1}><Outlet /></main>
    </div>
  </div>
}
