import api from './api'
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

function normalizarPerfil(perfil: unknown): PerfilUsuario {
  const p = String(perfil ?? '').toLowerCase()
  if (p === 'admin') return 'admin'
  if (p === 'colaborador') return 'colaborador'
  return 'profissional'
}

function normalizarUsuario(u: Usuario): Usuario {
  return {
    ...u,
    perfil: normalizarPerfil(u.perfil),
  }
}

export const authService = {
  async entrar(dados: LoginDTO): Promise<AuthResponse> {
    const resposta = await api.post<AuthResponse>('/auth/entrar', dados)
    return {
      token: resposta.data.token,
      usuario: normalizarUsuario(resposta.data.usuario),
    }
  },

  async cadastrar(dados: CadastroDTO): Promise<AuthResponse> {
    const resposta = await api.post<AuthResponse>('/auth/cadastrar', dados)
    return {
      token: resposta.data.token,
      usuario: normalizarUsuario(resposta.data.usuario),
    }
  },

  async perfil(): Promise<Usuario> {
    const resposta = await api.get<Usuario>('/auth/perfil')
    return normalizarUsuario(resposta.data)
  },

  async sair(): Promise<void> {
    try {
      await api.post('/auth/sair')
    } finally {
      localStorage.removeItem('@mutua:token')
      localStorage.removeItem('@mutua:usuario')
    }
  },
}
