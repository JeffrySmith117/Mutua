import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/authStore'
import type { PerfilUsuario } from '../../types'

interface RotaProtegidaProps {
  children: ReactNode
  redirecionarPara?: string
  perfisPermitidos?: PerfilUsuario[]
}

export default function RotaProtegida({
  children,
  redirecionarPara = '/entrar',
  perfisPermitidos,
}: RotaProtegidaProps) {
  const { estaAutenticado, usuario } = useAuthStore()

  if (!estaAutenticado) {
    return <Navigate to={redirecionarPara} replace />
  }

  // D05: Validação de perfis autorizados (ex: rota /admin exclusiva para admin)
  if (perfisPermitidos && perfisPermitidos.length > 0) {
    const perfilUsuario = (usuario?.perfil ? String(usuario.perfil).toLowerCase() : '') as PerfilUsuario
    const temPermissao = perfisPermitidos.some(
      (p) => String(p).toLowerCase() === perfilUsuario
    )

    if (!temPermissao) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
