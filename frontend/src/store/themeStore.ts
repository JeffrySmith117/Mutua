import { create } from 'zustand'

export type Tema = 'claro' | 'escuro'

interface ThemeState {
  tema: Tema
  alternarTema: () => void
  definirTema: (novoTema: Tema) => void
}

const obterTemaInicial = (): Tema => {
  try {
    const temaSalvo = localStorage.getItem('@mutua:tema') as Tema | null
    if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
      document.documentElement.setAttribute('data-theme', temaSalvo)
      return temaSalvo
    }
    const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const temaPadrao = prefereEscuro ? 'escuro' : 'claro'
    document.documentElement.setAttribute('data-theme', temaPadrao)
    return temaPadrao
  } catch {
    document.documentElement.setAttribute('data-theme', 'claro')
    return 'claro'
  }
}

const temaInicial = obterTemaInicial()

export const useThemeStore = create<ThemeState>((set) => ({
  tema: temaInicial,
  alternarTema: () => {
    set((state) => {
      const proximoTema: Tema = state.tema === 'claro' ? 'escuro' : 'claro'
      localStorage.setItem('@mutua:tema', proximoTema)
      document.documentElement.setAttribute('data-theme', proximoTema)
      return { tema: proximoTema }
    })
  },
  definirTema: (novoTema: Tema) => {
    localStorage.setItem('@mutua:tema', novoTema)
    document.documentElement.setAttribute('data-theme', novoTema)
    set({ tema: novoTema })
  },
}))
