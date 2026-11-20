// ============================================================
// Utilitários de Data Local (fuso horário do navegador)
// Resolve D10 (data mínima UTC virando dia às 21h em Teresina)
// e D22 (pureza de render para lint)
// ============================================================

export function formatarDataLocal(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function obterDataHojeLocal(): string {
  return formatarDataLocal(new Date())
}

export function obterDataAmanhaLocal(): string {
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  return formatarDataLocal(amanha)
}

export function obterDataFuturaLocal(dias: number): string {
  const futura = new Date()
  futura.setDate(futura.getDate() + dias)
  return formatarDataLocal(futura)
}


export function diaDaSemana(data: string): number {
  return new Date(data + 'T12:00:00Z').getUTCDay() || 7
}

export function proximaDataDeFuncionamento(diasSemana?: number[], agora = new Date()): string {
  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Fortaleza' }).format(agora)
  const data = new Date(hoje + 'T12:00:00Z')
  const dias = diasSemana?.length ? diasSemana : [1, 2, 3, 4, 5]
  for (let i = 0; i < 7; i++) {
    data.setUTCDate(data.getUTCDate() + 1)
    const candidata = data.toISOString().slice(0, 10)
    if (dias.includes(diaDaSemana(candidata))) return candidata
  }
  return hoje
}
