import { queryOptions } from '@tanstack/react-query'
import { ambienteService } from './ambienteService'
import { equipamentoService } from './equipamentoService'
import { reservaService } from './reservaService'

export const consultarAmbientes = queryOptions({
  queryKey: ['ambientes'],
  queryFn: ({ signal }) => ambienteService.listar(signal),
})

export const consultarEquipamentos = queryOptions({
  queryKey: ['equipamentos'],
  queryFn: ({ signal }) => equipamentoService.listar(signal),
})

export const consultarReservas = (usuarioId: string) => queryOptions({
  queryKey: ['minhas-reservas', usuarioId],
  queryFn: ({ signal }) => reservaService.listar(signal),
})

export const statusReserva = {
  pendente: 'Em análise', confirmada: 'Confirmada', em_uso: 'Em uso',
  em_andamento: 'Em uso', concluida: 'Concluída', cancelada: 'Cancelada',
  recusada: 'Recusada', nao_compareceu: 'Não compareceu',
}

export const statusEquipamento = { disponivel: 'Disponível', em_uso: 'Em campo' }

export function linkRecurso(tipo: 'ambientes' | 'equipamentos', id: string) {
  return `/${tipo}?id=${encodeURIComponent(id)}`
}
