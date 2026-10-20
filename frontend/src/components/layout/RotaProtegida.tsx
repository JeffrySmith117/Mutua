import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/authStore'

interface RotaProtegidaProps {
  children: ReactNode
  redirecionarPara?: string
}

export default function RotaProtegida({
  children,
  redirecionarPara = '/entrar',
}: RotaProtegidaProps) {
  const { estaAutenticado } = useAuthStore()

  if (!estaAutenticado) {
    return <Navigate to={redirecionarPara} replace />
  }

  return <>{children}</>
}
