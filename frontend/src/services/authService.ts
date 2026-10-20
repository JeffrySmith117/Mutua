import api from './api'
import type { Usuario } from '../types'

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

export const authService = {
  async entrar(dados: LoginDTO): Promise<AuthResponse> {
    const resposta = await api.post<AuthResponse>('/auth/entrar', dados)
    return resposta.data
  },

  async cadastrar(dados: CadastroDTO): Promise<AuthResponse> {
    const resposta = await api.post<AuthResponse>('/auth/cadastrar', dados)
    return resposta.data
  },

  async perfil(): Promise<Usuario> {
    const resposta = await api.get<Usuario>('/auth/perfil')
    return resposta.data
  },

  async sair(): Promise<void> {
    await api.post('/auth/sair')
  },
}
