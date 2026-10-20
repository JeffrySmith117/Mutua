import { create } from 'zustand'
import type { Usuario } from '../types'

interface AuthState {
  usuario: Usuario | null
  token: string | null
  estaAutenticado: boolean
  carregando: boolean

  // Ações
  definirUsuario: (usuario: Usuario, token: string) => void
  sair: () => void
  definirCarregando: (carregando: boolean) => void
}

const obterUsuarioSalvo = (): Usuario | null => {
  try {
    const usuarioSalvo = localStorage.getItem('@mutua:usuario')
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null
  } catch {
    return null
  }
}

const tokenSalvo = localStorage.getItem('@mutua:token')
const usuarioInicial = obterUsuarioSalvo()

export const useAuthStore = create<AuthState>((set) => ({
  usuario: usuarioInicial,
  token: tokenSalvo,
  estaAutenticado: !!tokenSalvo,
  carregando: false,

  definirUsuario: (usuario, token) => {
    localStorage.setItem('@mutua:token', token)
    localStorage.setItem('@mutua:usuario', JSON.stringify(usuario))
    set({
      usuario,
      token,
      estaAutenticado: true,
      carregando: false,
    })
  },

  sair: () => {
    localStorage.removeItem('@mutua:token')
    localStorage.removeItem('@mutua:usuario')
    set({
      usuario: null,
      token: null,
      estaAutenticado: false,
      carregando: false,
    })
  },

  definirCarregando: (carregando) => set({ carregando }),
}))
