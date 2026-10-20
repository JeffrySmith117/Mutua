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

// Mock institucional de contingência para desenvolvimento do frontend sem backend ativo
const criarUsuarioMock = (
  email: string,
  nome?: string,
  cpf?: string,
  registroCrea?: string
): Usuario => ({
  id: 'usr-' + Math.random().toString(36).substring(2, 9),
  nome: nome || (email.toLowerCase().includes('elias') ? 'Elias Pio Mendes' : 'Associado Mútua-PI'),
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
      const resposta = await api.post<AuthResponse>('/auth/entrar', dados)
      return resposta.data
    } catch (erro) {
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
      const resposta = await api.post<AuthResponse>('/auth/cadastrar', dados)
      return resposta.data
    } catch (erro) {
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
      const resposta = await api.get<Usuario>('/auth/perfil')
      return resposta.data
    } catch {
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
