import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: adiciona token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@mutua:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: trata erros globais de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@mutua:token')
      window.location.href = '/entrar'
    }
    return Promise.reject(error)
  }
)

export default api
