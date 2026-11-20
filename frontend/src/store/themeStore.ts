import { create } from 'zustand'

export type Tema = 'claro' | 'escuro'
const chave = '@mutua:tema'
const sistema = window.matchMedia('(prefers-color-scheme: dark)')
let preferencia: Tema | undefined

try {
  const salva = localStorage.getItem(chave)
  if (salva === 'claro' || salva === 'escuro') preferencia = salva
} catch {
  // O tema pode ser usado durante a sessão mesmo sem armazenamento.
}

function aplicar(tema: Tema) {
  document.documentElement.dataset.theme = tema
  return tema
}

export const useThemeStore = create<{ tema: Tema; alternarTema: () => void }>((set, get) => ({
  tema: aplicar(preferencia ?? (sistema.matches ? 'escuro' : 'claro')),
  alternarTema: () => {
    preferencia = get().tema === 'claro' ? 'escuro' : 'claro'
    try { localStorage.setItem(chave, preferencia) } catch { /* Mantém a preferência na sessão. */ }
    set({ tema: aplicar(preferencia) })
  },
}))

sistema.addEventListener('change', event => {
  if (!preferencia) useThemeStore.setState({ tema: aplicar(event.matches ? 'escuro' : 'claro') })
})
