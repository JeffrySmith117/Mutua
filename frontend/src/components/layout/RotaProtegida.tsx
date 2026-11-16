import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/authStore'
import type { PerfilUsuario } from '../../types'

interface RotaProtegidaProps {
  children: ReactNode
  redirecionarPara?: string
  /** Se informado, só esses perfis acessam; os demais voltam para o início. */
  perfisPermitidos?: PerfilUsuario[]
}

export default function RotaProtegida({
  children,
  redirecionarPara = '/entrar',
  perfisPermitidos,
}: RotaProtegidaProps) {
  const { estaAutenticado, usuario } = useAuthStore()

  if (!estaAutenticado || !usuario) {
    return <Navigate to={redirecionarPara} replace />
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
