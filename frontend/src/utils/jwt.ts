/**
 * Diz se o token já passou do `exp`. Token sem `exp` ou ilegível não é tratado como expirado aqui: quem decide
 * é o servidor (que responde 401), e o modo de demonstração usa tokens que não são JWT.
 */
export function tokenExpirado(token: string | null, agora: number = Date.now()): boolean {
  if (!token) return true
  try {
    const carga = token.split('.')[1]
    if (!carga) return false
    const { exp } = JSON.parse(atob(carga.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    return typeof exp === 'number' && exp * 1000 <= agora
  } catch {
    return false
  }
}
