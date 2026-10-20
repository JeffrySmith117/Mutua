import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import './Auth.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { definirUsuario, definirCarregando, carregando } = useAuthStore()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    definirCarregando(true)

    try {
      const resposta = await authService.entrar({ email, senha })
      definirUsuario(resposta.usuario, resposta.token)
      navigate('/')
    } catch {
      setErro('E-mail ou senha incorretos. Verifique e tente novamente.')
      definirCarregando(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Painel decorativo esquerdo */}
      <div className="auth-painel-esquerdo">
        <div className="auth-painel-conteudo">
          <div className="auth-logo-grande">
            <div className="auth-logo-icone">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                <path d="M4 16H44" stroke="currentColor" strokeWidth="2.5"/>
                <rect x="10" y="22" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="28" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="28" y1="27" x2="35" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="28" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="10" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <h1 className="auth-titulo-painel">Mútua-PI</h1>
          <p className="auth-subtitulo-painel">
            Sistema de Gestão de Reservas de Ambientes e Equipamentos
          </p>

          <div className="auth-cards-flutuantes">
            <div className="auth-card-flutuante card-1">
              <div className="card-flutuante-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span>Reserva de Ambientes</span>
            </div>
            <div className="auth-card-flutuante card-2">
              <div className="card-flutuante-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <span>Crea Tec HUB</span>
            </div>
            <div className="auth-card-flutuante card-3">
              <div className="card-flutuante-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span>Coworking</span>
            </div>
          </div>
        </div>

        {/* Elementos decorativos de fundo */}
        <div className="auth-decoracao auth-decoracao-1"></div>
        <div className="auth-decoracao auth-decoracao-2"></div>
        <div className="auth-decoracao auth-decoracao-3"></div>
      </div>

      {/* Painel do formulário */}
      <div className="auth-painel-formulario">
        <div className="auth-formulario-wrapper">
          <div className="auth-formulario-header">
            <div className="auth-logo-mobile">
              <div className="auth-logo-icone-sm">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                  <path d="M4 16H44" stroke="currentColor" strokeWidth="2.5"/>
                  <rect x="10" y="22" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="28" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="28" y1="27" x2="35" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Mútua-PI</span>
            </div>
            <h2 className="auth-titulo-formulario">Bem-vindo de volta</h2>
            <p className="auth-subtitulo-formulario">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form className="auth-formulario" onSubmit={handleSubmit} id="form-login">
            {erro && (
              <div className="auth-alerta auth-alerta-erro animar-entrada" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-alerta-icone">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>{erro}</span>
              </div>
            )}

            <div className="auth-campo">
              <label htmlFor="login-email" className="auth-label">E-mail</label>
              <div className="auth-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-campo">
              <div className="auth-label-wrapper">
                <label htmlFor="login-senha" className="auth-label">Senha</label>
                <Link to="/recuperar-senha" className="auth-link-esqueceu">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="login-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-senha"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-botao-principal"
              id="btn-login"
              disabled={carregando}
            >
              {carregando ? (
                <div className="auth-spinner"></div>
              ) : (
                <>
                  Entrar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-botao-seta">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-separador">
            <span>Novo por aqui?</span>
          </div>

          <p className="auth-link-alternar">
            <Link to="/cadastro" className="auth-link-destaque" id="link-cadastro">
              Criar uma conta
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-link-seta">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </p>

          <p className="auth-rodape">
            Mútua — Caixa de Assistência dos Profissionais do CREA-PI
          </p>
        </div>
      </div>
    </div>
  )
}
