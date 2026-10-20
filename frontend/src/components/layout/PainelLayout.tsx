import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './PainelLayout.css'

export default function PainelLayout() {
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const [termoBusca, setTermoBusca] = useState('')

  const { usuario, sair } = useAuthStore()
  const navigate = useNavigate()

  // Usuário padrão de exibição caso não haja login persistido ainda
  const usuarioExibicao = usuario || {
    id: 'mock-1',
    nome: 'Elias Pio Mendes',
    email: 'elias.mendes@creapi.org.br',
    cpf: '123.456.789-00',
    registroCrea: 'CREA-PI 32415/D',
    perfil: 'profissional' as const,
    ativo: true,
    criadoEm: new Date().toISOString(),
  }

  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map((parte) => parte[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const handleLogout = () => {
    sair()
    navigate('/entrar')
  }

  const fecharSidebar = () => setSidebarAberta(false)

  return (
    <div className="painel-container">
      {/* Overlay mobile para fechar sidebar */}
      {sidebarAberta && (
        <div
          className="painel-overlay"
          onClick={fecharSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Lateral */}
      <aside className={`painel-sidebar ${sidebarAberta ? 'sidebar-visivel' : ''}`}>
        <div className="sidebar-cabecalho">
          <div className="sidebar-logo">
            <div className="logo-icone-wrapper">
              <svg viewBox="0 0 40 40" fill="none" className="logo-svg">
                <rect width="40" height="40" rx="10" fill="url(#logo-gradiente-layout)" />
                <path d="M12 28L20 12L28 28H23L20 21L17 28H12Z" fill="white" />
                <circle cx="20" cy="18" r="3" fill="#2EAF7D" />
                <defs>
                  <linearGradient id="logo-gradiente-layout" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#1B4D6E" />
                    <stop offset="1" stopColor="#0B2335" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-texto-bloco">
              <span className="logo-marca">Mútua-PI</span>
              <span className="logo-subtitulo">Espaços & Hub CREA</span>
            </div>
          </div>

          <button
            type="button"
            className="botao-fechar-sidebar"
            onClick={fecharSidebar}
            aria-label="Fechar navegação"
          >
            ✕
          </button>
        </div>

        {/* Tag do Associado */}
        <div className="sidebar-associado-status">
          <div className="indicador-online" />
          <span>Associado CREA-PI Ativo</span>
        </div>

        {/* Menu de Navegação */}
        <nav className="sidebar-nav">
          <div className="nav-grupo">
            <span className="nav-grupo-titulo">Menu Principal</span>

            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-ativo' : ''}`}
              onClick={fecharSidebar}
            >
              <span className="nav-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span className="nav-texto">Painel Inicial</span>
            </NavLink>

            <NavLink
              to="/ambientes"
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-ativo' : ''}`}
              onClick={fecharSidebar}
            >
              <span className="nav-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M12 6h.01" />
                  <path d="M12 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 10h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 10h.01" />
                  <path d="M8 14h.01" />
                </svg>
              </span>
              <span className="nav-texto">Salas & Coworking</span>
              <span className="nav-badge">Disponíveis</span>
            </NavLink>

            <NavLink
              to="/equipamentos"
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-ativo' : ''}`}
              onClick={fecharSidebar}
            >
              <span className="nav-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span className="nav-texto">Equipamentos HUB</span>
              <span className="nav-tag-destaque">Tec</span>
            </NavLink>

            <NavLink
              to="/minhas-reservas"
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-ativo' : ''}`}
              onClick={fecharSidebar}
            >
              <span className="nav-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span className="nav-texto">Minhas Reservas</span>
            </NavLink>
          </div>

          <div className="nav-grupo">
            <span className="nav-grupo-titulo">Informações & Apoio</span>

            <a
              href="#regras-uso"
              className="nav-item"
              onClick={(e) => {
                e.preventDefault()
                alert('Regulamento de Uso do Coworking e Equipamentos HUB Mútua-PI disponível na seção de Ajuda.')
              }}
            >
              <span className="nav-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <span className="nav-texto">Regulamento de Uso</span>
            </a>

            <a
              href="mailto:suporte@mutua-pi.com.br"
              className="nav-item"
            >
              <span className="nav-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span className="nav-texto">Suporte ao Associado</span>
            </a>
          </div>
        </nav>

        {/* Card institucional no rodapé da sidebar */}
        <div className="sidebar-rodape-card">
          <div className="rodape-card-badge">Crea Tec HUB</div>
          <p className="rodape-card-titulo">Espaço de Inovação & Tecnologia</p>
          <p className="rodape-card-desc">
            Equipamentos de alta precisão disponíveis para profissionais com anuidade em dia.
          </p>
          <div className="rodape-card-rodape">
            <span>Sede Mútua • Teresina-PI</span>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal + Header */}
      <div className="painel-corpo">
        {/* Header Superior */}
        <header className="painel-header">
          <div className="header-esquerda">
            <button
              type="button"
              className="botao-menu-mobile"
              onClick={() => setSidebarAberta(true)}
              aria-label="Abrir menu lateral"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="header-busca">
              <span className="icone-busca">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Pesquisar salas, auditórios, drones, equipamentos..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="input-busca-header"
              />
              <span className="atalho-busca">Ctrl K</span>
            </div>
          </div>

          <div className="header-direita">
            {/* Notificações */}
            <button
              type="button"
              className="botao-notificacao"
              title="Notificações e avisos"
              onClick={() => alert('Nenhuma nova notificação no momento.')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="badge-notificacao-ponto" />
            </button>

            {/* Divisor */}
            <div className="header-divisor" />

            {/* Perfil do Usuário */}
            <div className="perfil-menu-container">
              <button
                type="button"
                className="botao-perfil"
                onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
                aria-expanded={menuPerfilAberto}
              >
                <div className="perfil-avatar">
                  {obterIniciais(usuarioExibicao.nome)}
                </div>
                <div className="perfil-info">
                  <span className="perfil-nome">{usuarioExibicao.nome}</span>
                  <span className="perfil-crea">{usuarioExibicao.registroCrea || 'Profissional CREA-PI'}</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`seta-dropdown ${menuPerfilAberto ? 'seta-aberta' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuPerfilAberto && (
                <>
                  <div
                    className="overlay-menu-perfil"
                    onClick={() => setMenuPerfilAberto(false)}
                  />
                  <div className="dropdown-perfil">
                    <div className="dropdown-cabecalho">
                      <p className="dropdown-nome">{usuarioExibicao.nome}</p>
                      <p className="dropdown-email">{usuarioExibicao.email}</p>
                      <span className="dropdown-tag-tipo">
                        {usuarioExibicao.perfil === 'admin' ? 'Administrador' : 'Profissional Habilitado'}
                      </span>
                    </div>

                    <div className="dropdown-divisor" />

                    <div className="dropdown-acoes">
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          setMenuPerfilAberto(false)
                          navigate('/minhas-reservas')
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                        </svg>
                        <span>Minhas Reservas Ativas</span>
                      </button>

                      <button
                        type="button"
                        className="dropdown-item item-logout"
                        onClick={handleLogout}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Encerrar Sessão</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo Dinâmico das Rotas */}
        <main className="painel-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
