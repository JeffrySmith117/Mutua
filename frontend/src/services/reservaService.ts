import api from './api'
import type { StatusReserva } from '../types'

export interface ItemReservaCompleto {
  id: string
  tipo: 'ambiente' | 'equipamento'
  protocolo: string
  titulo: string
  subtitulo: string
  localOuPatrimonio: string
  dataInicio: string
  dataFim: string
  status: StatusReserva
  finalidade: string
  criadoEm: string
  permitirCancelamento: boolean
  permitirCheckin: boolean
  motivoCancelamentoOuRecusa?: string
  detalhesTecnicos?: string[]
}

function normalizarStatus(status: unknown): StatusReserva {
  const s = String(status ?? '').toLowerCase()
  if (s === 'pendente') return 'pendente'
  if (s === 'confirmada') return 'confirmada'
  if (s === 'em_uso' || s === 'em_andamento') return 'em_uso'
  if (s === 'concluida') return 'concluida'
  if (s === 'cancelada') return 'cancelada'
  if (s === 'recusada') return 'recusada'
  if (s === 'nao_compareceu') return 'nao_compareceu'
  return 'pendente'
}

function normalizarItemReserva(r: any): ItemReservaCompleto {
  const statusNormalizado = normalizarStatus(r.status)
  return {
    id: String(r.id),
    tipo: r.tipo === 'equipamento' ? 'equipamento' : 'ambiente',
    protocolo: r.protocolo || 'MUT-2026-0000',
    titulo: r.titulo || r.recursoNome || 'Reserva Mútua-PI',
    subtitulo: r.subtitulo || (r.tipo === 'equipamento' ? 'Crea Tec HUB' : 'Espaço Sede'),
    localOuPatrimonio: r.localOuPatrimonio || r.patrimonioOuLocal || 'Sede Mútua-PI',
    dataInicio: r.dataInicio,
    dataFim: r.dataFim,
    status: statusNormalizado,
    finalidade: r.finalidade || r.observacoes || 'Finalidade profissional de engenharia',
    criadoEm: r.criadoEm || new Date().toISOString(),
    permitirCancelamento: Boolean(r.permitirCancelamento ?? r.podeCancelar ?? (statusNormalizado === 'confirmada' || statusNormalizado === 'pendente')),
    permitirCheckin: Boolean(r.permitirCheckin ?? r.podeCheckin ?? (statusNormalizado === 'confirmada')),
    motivoCancelamentoOuRecusa: r.motivoCancelamentoOuRecusa || r.motivoRecusaCancelamento,
    detalhesTecnicos: r.detalhesTecnicos || [],
  }
}

export const reservaService = {
  async listar(): Promise<ItemReservaCompleto[]> {
    const resposta = await api.get<any[]>('/reservas')
    if (Array.isArray(resposta.data)) {
      return resposta.data.map(normalizarItemReserva)
    }
    return []
  },

  /**
   * D01: Propaga erros do backend (ex: 409 reserva não cancelável, 403 sem permissão).
   */
  async cancelar(id: string, motivo?: string): Promise<boolean> {
    await api.delete(`/reservas/${id}`, {
      data: motivo ? { motivo } : undefined,
    })
    return true
  },

  /**
   * D01: Propaga erros do backend (ex: 409 fora da janela de tolerância de check-in).
   */
  async realizarCheckin(id: string): Promise<boolean> {
    await api.post(`/reservas/${id}/checkin`)
    return true
  },
}
