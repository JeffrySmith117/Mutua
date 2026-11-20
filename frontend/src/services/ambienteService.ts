import api from './api'
import type { Ambiente } from '../types'

export interface AmbienteCompleto extends Omit<Ambiente, 'tipo'> {
  tipo: 'coworking' | 'sala' | 'auditorio'
  localizacao?: string
  recursosDisponiveis: string[]
  horarioFuncionamento?: string
  horarioAbertura?: string
  horarioFechamento?: string
  exigeAprovacao: boolean
  diasSemana?: number[]
}

export interface CriarReservaAmbienteDTO {
  ambienteId: string
  data: string
  horarioInicio: string
  horarioFim: string
  finalidade: string
  quantidadePessoas?: number
  observacoes?: string
}

export interface RespostaReservaCriada {
  id: string
  protocolo: string
  recursoId?: string
  recursoNome?: string
  usuarioId?: string
  status?: string
  dataInicio?: string
  dataFim?: string
  criadoEm?: string
  mensagem?: string
}

export const ambienteService = {
  async listar(signal?: AbortSignal): Promise<AmbienteCompleto[]> {
    const { data } = await api.get<AmbienteCompleto[]>('/ambientes', { signal })
    return data.map(item => ({
      ...item,
      tipo: item.tipo.toLowerCase() as AmbienteCompleto['tipo'],
      recursosDisponiveis: item.recursosDisponiveis ?? [],
    }))
  },

  async reservar(dados: CriarReservaAmbienteDTO): Promise<RespostaReservaCriada> {
    const resposta = await api.post<RespostaReservaCriada>('/reservas', {
      tipo: 'ambiente',
      ...dados,
    })
    return resposta.data
  },
}
