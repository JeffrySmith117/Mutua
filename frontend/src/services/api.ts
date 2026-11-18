import axios from 'axios'
import { tokenExpirado } from '../utils/jwt'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Login e cadastro: um 401 aqui significa "senha incorreta", não "sessão expirada".
const ROTAS_DE_AUTENTICACAO = ['/auth/login', '/auth/cadastro']

// Interceptor: adiciona token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@mutua:token')
  if (token && tokenExpirado(token)) {
    // Token vencido: nem chega ao servidor, a sessão termina aqui.
    localStorage.removeItem('@mutua:token')
    localStorage.removeItem('@mutua:usuario')
    if (window.location.pathname !== '/entrar') {
      window.location.href = '/entrar'
    }
    throw new axios.CanceledError('Sessão expirada. Entre novamente.')
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: trata erros globais de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const rotaDeAutenticacao = ROTAS_DE_AUTENTICACAO.some((rota) => error.config?.url?.endsWith(rota))
    // Só encerra a sessão se o token da requisição que falhou ainda for o atual: um 401 atrasado de um
    // token antigo não pode derrubar a sessão recém-iniciada.
    const tokenAtual = localStorage.getItem('@mutua:token')
    const autorizacaoEnviada = error.config?.headers?.Authorization
    const tokenDaRequisicaoEhOAtual = !!tokenAtual && autorizacaoEnviada === `Bearer ${tokenAtual}`
    if (error.response?.status === 401 && !rotaDeAutenticacao && tokenDaRequisicaoEhOAtual) {
      localStorage.removeItem('@mutua:token')
      localStorage.removeItem('@mutua:usuario')
      window.location.href = '/entrar'
    }
    return Promise.reject(error)
  }
)

/**
 * Modo de demonstração autônomo (sem back-end): defina VITE_USE_MOCK=true no .env. Com a API ligada (padrão),
 * os serviços repassam o erro real para a tela, em vez de simular sucesso.
 */
export const USAR_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** Chamar no início de cada `catch` que tem alternativa local: fora do modo mock, o erro segue para a tela. */
export function falharSeNaoForMock(erro: unknown): void {
  if (!USAR_MOCK) {
    throw erro
  }
}

interface CorpoDeErro {
  message?: string
  validationErrors?: { field: string; message: string }[]
}

/** Texto amigável para mostrar ao usuário a partir de um erro da API (formato descrito em docs/contrato). */
export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError<CorpoDeErro>(erro)) {
    if (!erro.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
    }
    const corpo = erro.response.data
    const detalhes = corpo?.validationErrors?.map((e) => e.message).filter(Boolean) ?? []
    if (detalhes.length > 0) {
      return detalhes.join(' ')
    }
    if (corpo?.message) {
      return corpo.message
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export default api
