import api, { falharSeNaoForMock } from './api'
import type { PerfilUsuario, Usuario } from '../types'

export interface LoginDTO {
  email: string
  senha: string
}

export interface CadastroDTO {
  nome: string
  email: string
  cpf: string
  senha: string
  confirmarSenha: string
  registroCrea?: string
}

export interface AuthResponse {
  usuario: Usuario
  token: string
}

// A API devolve o perfil em maiúsculas (PROFISSIONAL, ADMIN); as telas comparam em minúsculas.
type UsuarioApi = Omit<Usuario, 'perfil'> & { perfil: string }

interface AuthResponseApi {
  usuario: UsuarioApi
  token: string
}

const paraUsuario = (usuario: UsuarioApi): Usuario => ({
  ...usuario,
  perfil: usuario.perfil.toLowerCase() as PerfilUsuario,
})

const paraAuthResponse = (resposta: AuthResponseApi): AuthResponse => ({
  token: resposta.token,
  usuario: paraUsuario(resposta.usuario),
})

// Mock institucional de contingência para desenvolvimento do frontend sem backend ativo
const criarUsuarioMock = (
  email: string,
  nome?: string,
  cpf?: string,
  registroCrea?: string
): Usuario => ({
  id: 'usr-' + Math.random().toString(36).substring(2, 9),
  nome: nome || 'Associado Mútua-PI',
  email: email,
  cpf: cpf || '123.456.789-00',
  registroCrea: registroCrea || 'CREA-PI 32415/D',
  perfil: 'profissional',
  ativo: true,
  criadoEm: new Date().toISOString(),
})

export const authService = {
  async entrar(dados: LoginDTO): Promise<AuthResponse> {
    try {
      const resposta = await api.post<AuthResponseApi>('/auth/login', dados)
      return paraAuthResponse(resposta.data)
    } catch (erro) {
      falharSeNaoForMock(erro)
      console.warn(
        '[Mútua-PI] Backend não detectado. Iniciando sessão com dados simulados para desenvolvimento frontend:',
        erro
      )
      // Simulação de latência de rede realista (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300))

      return {
        usuario: criarUsuarioMock(dados.email),
        token: 'mock-token-mutua-' + Date.now(),
      }
    }
  },

  async cadastrar(dados: CadastroDTO): Promise<AuthResponse> {
    try {
      const resposta = await api.post<AuthResponseApi>('/auth/cadastro', dados)
      return paraAuthResponse(resposta.data)
    } catch (erro) {
      falharSeNaoForMock(erro)
      console.warn(
        '[Mútua-PI] Backend não detectado. Concluindo cadastro simulado para desenvolvimento frontend:',
        erro
      )
      await new Promise((resolve) => setTimeout(resolve, 300))

      return {
        usuario: criarUsuarioMock(dados.email, dados.nome, dados.cpf, dados.registroCrea),
        token: 'mock-token-mutua-' + Date.now(),
      }
    }
  },

  async perfil(): Promise<Usuario> {
    try {
      const resposta = await api.get<UsuarioApi>('/auth/me')
      return paraUsuario(resposta.data)
    } catch (erro) {
      falharSeNaoForMock(erro)
      return criarUsuarioMock('elias.mendes@creapi.org.br')
    }
  },

  async sair(): Promise<void> {
    try {
      await api.post('/auth/sair')
    } catch {
      // Ignora erro de rede quando backend estiver offline
    }
  },
}
