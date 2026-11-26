import axios from 'axios'
import { tokenExpirado } from '../utils/jwt'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

// Interceptor: trata erros globais de autenticação (D02 e D03)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const urlRequisicao = error.config?.url || ''
      const ehRotaAuth =
        urlRequisicao.includes('/auth/entrar') ||
        urlRequisicao.includes('/auth/cadastrar')

      const caminhoAtual = typeof window !== 'undefined' ? window.location.pathname : ''
      const ehPaginaAuth = caminhoAtual === '/entrar' || caminhoAtual === '/cadastro'

      // Não redirecionar se o 401 for decorrente de credenciais inválidas na tela de login/cadastro
      if (!ehRotaAuth && !ehPaginaAuth) {
        localStorage.removeItem('@mutua:token')
        localStorage.removeItem('@mutua:usuario')
        if (typeof window !== 'undefined' && window.location.pathname !== '/entrar') {
          window.location.href = '/entrar'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
