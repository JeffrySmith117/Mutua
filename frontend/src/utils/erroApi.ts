import axios from 'axios'
import type { ErroResposta } from '../types'

/**
 * Extrai uma mensagem de erro legível e completa a partir de erros da API (Axios).
 * Garante que mensagens de conflito (409), validação (400), permissão (403), etc.
 * sejam exibidas claramente ao usuário em vez de engolidas.
 */
export function extrairMensagemErro(erro: unknown, fallback = 'Ocorreu um erro ao processar a solicitação.'): string {
  if (axios.isAxiosError(erro)) {
    const data = erro.response?.data as (ErroResposta & {
      message?: string
      validationErrors?: { field: string; message: string }[]
    }) | undefined

    if (data && typeof data === 'object') {
      const mensagem = data.message ?? data.mensagem
      const detalhes = Array.isArray(data.validationErrors)
        ? data.validationErrors.map(item => item.message)
        : Array.isArray(data.erros) ? data.erros.map(item => item.mensagem) : []
      const explicacoes = [...new Set(detalhes.filter(texto => texto && texto !== mensagem))]
      if (explicacoes.length) return explicacoes.join(' ')
      if (typeof mensagem === 'string' && mensagem.trim()) return mensagem
    }

    if (erro.response?.status === 400) {
      return fallback
    }

    if (erro.response?.status === 401) {
      return 'E-mail ou senha inválidos.'
    }

    if (erro.response?.status === 403) {
      return 'Você não tem permissão para realizar esta operação.'
    }

    if (erro.response?.status === 409) {
      return 'Conflito na operação: o horário ou recurso já está indisponível.'
    }

    if (erro.response?.status === 404) {
      return 'Recurso não encontrado.'
    }

    if (erro.message === 'Network Error' || erro.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique se o back-end está ativo em ' +
        (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1')
    }

    if (erro.message) {
      return erro.message
    }
  }

  if (erro instanceof Error) {
    return erro.message
  }

  return fallback
}

