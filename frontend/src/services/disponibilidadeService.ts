import api from './api'

interface Disponibilidade {
  horarioAbertura: string | null
  horarioFechamento: string | null
  intervalosOcupados: { inicio: string; fim: string }[]
}

export async function consultarDisponibilidade(
  catalogo: 'ambientes' | 'equipamentos', id: string, data: string, signal: AbortSignal,
) {
  const resposta = await api.get<Disponibilidade>(`/${catalogo}/${encodeURIComponent(id)}/disponibilidade`, {
    params: { data }, signal,
  })
  return resposta.data
}
