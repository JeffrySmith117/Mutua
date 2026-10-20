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

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: localStorage.getItem('@mutua:token'),
  estaAutenticado: !!localStorage.getItem('@mutua:token'),
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
