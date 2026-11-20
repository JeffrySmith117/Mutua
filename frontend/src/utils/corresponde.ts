export function corresponde(termo: string, ...campos: (string | null | undefined)[]) {
  const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const texto = normalizar(campos.join(' '))
  return normalizar(termo.trim()).split(/\s+/).every(palavra => texto.includes(palavra))
}
