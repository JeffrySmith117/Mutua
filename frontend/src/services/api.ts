import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  // A API no plano gratuito do Render dorme depois de 15 min sem acesso e leva 1 a 3 min para acordar.
  // 120s cobre esse primeiro acesso sem estourar o login.
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Acorda a API assim que o site abre, para ela já estar ligada quando o usuário clicar em "Entrar".
if (typeof window !== 'undefined') {
  fetch(`${BASE_URL}/actuator/health`).catch(() => undefined)
}

// Interceptor: adiciona token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@mutua:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const MAX_TENTATIVAS = 3
const ESPERA_ENTRE_TENTATIVAS_MS = 3000

type ConfigComTentativas = InternalAxiosRequestConfig & { _tentativas?: number }

/**
 * Repete a requisição só quando ela não chegou à API: erro de rede, ou 502/503 do proxy enquanto a máquina liga.
 * Timeout só é repetido em GET, porque um POST/PUT pode ter sido processado e repetir duplicaria a operação.
 */
function deveRepetir(error: AxiosError): boolean {
  const config = error.config as ConfigComTentativas | undefined
  if (!config || (config._tentativas ?? 0) >= MAX_TENTATIVAS) return false
  const status = error.response?.status
  if (status === 502 || status === 503) return true
  if (!error.response && error.code === 'ERR_NETWORK') return true
  const metodo = (config.method ?? 'get').toLowerCase()
  return error.code === 'ECONNABORTED' && metodo === 'get'
}

// Interceptor: repete quando a API está ligando e trata erros globais de autenticação (D02 e D03)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (deveRepetir(error)) {
      const config = error.config as ConfigComTentativas
      config._tentativas = (config._tentativas ?? 0) + 1
      await new Promise((resolve) => setTimeout(resolve, ESPERA_ENTRE_TENTATIVAS_MS))
      return api(config)
    }

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
