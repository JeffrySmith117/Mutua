/** Confere tamanho e dígitos verificadores do CPF (mesma regra do back-end). */
export function cpfValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, '')
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false

  const verificador = (quantidade: number) => {
    let soma = 0
    for (let i = 0; i < quantidade; i++) {
      soma += Number(digitos[i]) * (quantidade + 1 - i)
    }
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return verificador(9) === Number(digitos[9]) && verificador(10) === Number(digitos[10])
}
