import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { extrairMensagemErro } from '../../utils/erroApi'
import Icone from '../../components/Icone'
import AcessoLayout from './AcessoLayout'

export default function LoginPage() {
  const navigate = useNavigate()
  const { definirUsuario, definirCarregando, carregando } = useAuthStore()
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [erro, setErro] = useState('')

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (carregando) return
    const campos = new FormData(event.currentTarget)
    setErro('')
    definirCarregando(true)
    try {
      const resposta = await authService.entrar({
        email: String(campos.get('email')).trim(), senha: String(campos.get('senha')),
      })
      definirUsuario(resposta.usuario, resposta.token)
      navigate('/', { replace: true })
    } catch (falha) {
      setErro(extrairMensagemErro(falha, 'Não foi possível entrar. Verifique seu e-mail e sua senha.'))
      definirCarregando(false)
    }
  }

  return <AcessoLayout tituloId="titulo-login">
      <div className="login-formulario">
        <h1 id="titulo-login">Boas-vindas ao HUB</h1>
        <p className="texto-apoio">Use seu e-mail e sua senha para acessar sua conta.</p>
        <form onSubmit={entrar} aria-busy={carregando}>
          {erro && <p className="erro-sigra" role="alert">{erro}</p>}
          <label>E-mail <input className="controle-campo" id="login-email" name="email" type="email"
            autoComplete="username" required /></label>
          <div className="login-senha">
            <label>Senha <input className="controle-campo" id="login-senha" name="senha"
              type={senhaVisivel ? 'text' : 'password'} autoComplete="current-password" required /></label>
            <button type="button" className="controle-icone" aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
              title={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setSenhaVisivel(!senhaVisivel)}><Icone nome={senhaVisivel ? "olhoOculto" : "olho"} /></button>
          </div>
          <button id="btn-login" className="btn btn-primario" type="submit" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'} <Icone nome="seta" />
          </button>
          {carregando && <span className="sr-only" role="status">Autenticando</span>}
        </form>
        <p className="login-cadastro">Primeiro acesso? <Link to="/cadastro" id="link-cadastro">Criar uma conta</Link></p>
      </div>
  </AcessoLayout>
}
