import axios from 'axios'
import type { ErroResposta } from '../types'

/**
 * Extrai uma mensagem de erro legível e completa a partir de erros da API (Axios).
 * Garante que mensagens de conflito (409), validação (400), permissão (403), etc.
 * sejam exibidas claramente ao usuário em vez de engolidas.
 */
export function extrairMensagemErro(erro: unknown, fallback = 'Ocorreu um erro ao processar a solicitação.'): string {
  if (axios.isAxiosError(erro)) {
    const data = erro.response?.data as ErroResposta | undefined

    if (data && typeof data === 'object') {
      if (typeof data.mensagem === 'string') {
        if (Array.isArray(data.erros) && data.erros.length > 0) {
          const detalhes = data.erros
            .map((item) => (item.campo ? `${item.campo}: ${item.mensagem}` : item.mensagem))
            .join(' | ')
          return `${data.mensagem} (${detalhes})`
        }
        return data.mensagem
      }

      // Outras estruturas comuns de erro
      if (typeof (data as unknown as { error?: string }).error === 'string') {
        return (data as unknown as { error: string }).error
      }
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

