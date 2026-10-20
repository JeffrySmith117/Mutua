import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import './Auth.css'

export default function CadastroPage() {
  const navigate = useNavigate()
  const { definirUsuario, definirCarregando, carregando } = useAuthStore()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [registroCrea, setRegistroCrea] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [etapa, setEtapa] = useState<1 | 2>(1)

  // Máscara de CPF
  function formatarCpf(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11)
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  function validarEtapa1(): boolean {
    if (!nome.trim()) {
      setErro('Informe seu nome completo.')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      setErro('Informe um e-mail válido.')
      return false
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      setErro('Informe um CPF válido com 11 dígitos.')
      return false
    }
    return true
  }

  function validarEtapa2(): boolean {
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return false
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return false
    }
    return true
  }

  function avancarEtapa() {
    setErro('')
    if (validarEtapa1()) {
      setEtapa(2)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    if (!validarEtapa2()) return

    definirCarregando(true)

    try {
      const resposta = await authService.cadastrar({
        nome,
        email,
        cpf: cpf.replace(/\D/g, ''),
        senha,
        confirmarSenha,
        registroCrea: registroCrea || undefined,
      })
      definirUsuario(resposta.usuario, resposta.token)
      navigate('/')
    } catch {
      setErro('Não foi possível criar a conta. Verifique os dados e tente novamente.')
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
            Junte-se à comunidade de profissionais do CREA-PI
          </p>

          <div className="auth-cards-flutuantes">
            <div className="auth-card-flutuante card-1">
              <div className="card-flutuante-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Reservas Simples</span>
            </div>
            <div className="auth-card-flutuante card-2">
              <div className="card-flutuante-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <span>Salas e Auditórios</span>
            </div>
            <div className="auth-card-flutuante card-3">
              <div className="card-flutuante-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Acesso Seguro</span>
            </div>
          </div>
        </div>

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
            <h2 className="auth-titulo-formulario">Crie sua conta</h2>
            <p className="auth-subtitulo-formulario">
              Preencha seus dados para começar a utilizar o sistema
            </p>

            {/* Indicador de etapas */}
            <div className="auth-etapas">
              <div className={`auth-etapa ${etapa >= 1 ? 'ativa' : ''}`}>
                <div className="auth-etapa-numero">1</div>
                <span>Dados pessoais</span>
              </div>
              <div className="auth-etapa-linha"></div>
              <div className={`auth-etapa ${etapa >= 2 ? 'ativa' : ''}`}>
                <div className="auth-etapa-numero">2</div>
                <span>Segurança</span>
              </div>
            </div>
          </div>

          <form className="auth-formulario" onSubmit={handleSubmit} id="form-cadastro">
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

            {/* Etapa 1: Dados pessoais */}
            {etapa === 1 && (
              <div className="auth-etapa-conteudo animar-entrada" key="etapa1">
                <div className="auth-campo">
                  <label htmlFor="cadastro-nome" className="auth-label">Nome completo</label>
                  <div className="auth-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      id="cadastro-nome"
                      type="text"
                      className="auth-input"
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="auth-campo">
                  <label htmlFor="cadastro-email" className="auth-label">E-mail</label>
                  <div className="auth-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      id="cadastro-email"
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
                  <label htmlFor="cadastro-cpf" className="auth-label">CPF</label>
                  <div className="auth-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <input
                      id="cadastro-cpf"
                      type="text"
                      className="auth-input"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatarCpf(e.target.value))}
                      required
                      maxLength={14}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="auth-campo">
                  <label htmlFor="cadastro-crea" className="auth-label">
                    Registro CREA <span className="auth-label-opcional">(opcional)</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                    <input
                      id="cadastro-crea"
                      type="text"
                      className="auth-input"
                      placeholder="PI-000000/D"
                      value={registroCrea}
                      onChange={(e) => setRegistroCrea(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="auth-botao-principal"
                  onClick={avancarEtapa}
                  id="btn-avancar-etapa"
                >
                  Continuar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-botao-seta">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Etapa 2: Segurança */}
            {etapa === 2 && (
              <div className="auth-etapa-conteudo animar-entrada" key="etapa2">
                <div className="auth-campo">
                  <label htmlFor="cadastro-senha" className="auth-label">Senha</label>
                  <div className="auth-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      id="cadastro-senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Mínimo 6 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
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

                  {/* Indicador de força da senha */}
                  <div className="auth-forca-senha">
                    <div className="auth-forca-barra">
                      <div
                        className={`auth-forca-progresso ${
                          senha.length === 0
                            ? ''
                            : senha.length < 6
                            ? 'fraca'
                            : senha.length < 10
                            ? 'media'
                            : 'forte'
                        }`}
                      ></div>
                    </div>
                    <span className="auth-forca-texto">
                      {senha.length === 0
                        ? ''
                        : senha.length < 6
                        ? 'Fraca'
                        : senha.length < 10
                        ? 'Média'
                        : 'Forte'}
                    </span>
                  </div>
                </div>

                <div className="auth-campo">
                  <label htmlFor="cadastro-confirmar-senha" className="auth-label">
                    Confirmar senha
                  </label>
                  <div className="auth-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icone">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <input
                      id="cadastro-confirmar-senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {confirmarSenha && (
                      <div className={`auth-input-status ${senha === confirmarSenha ? 'valido' : 'invalido'}`}>
                        {senha === confirmarSenha ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="auth-botoes-etapa">
                  <button
                    type="button"
                    className="auth-botao-secundario"
                    onClick={() => { setEtapa(1); setErro('') }}
                    id="btn-voltar-etapa"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-botao-seta-voltar">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="auth-botao-principal"
                    id="btn-cadastrar"
                    disabled={carregando}
                  >
                    {carregando ? (
                      <div className="auth-spinner"></div>
                    ) : (
                      <>
                        Criar conta
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-botao-seta">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="auth-separador">
            <span>Já tem uma conta?</span>
          </div>

          <p className="auth-link-alternar">
            <Link to="/entrar" className="auth-link-destaque" id="link-login">
              Fazer login
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
