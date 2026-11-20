import api from './api'
import type { Equipamento } from '../types'

export interface CriarSolicitacaoEquipamentoDTO {
  equipamentoId: string
  dataRetirada: string
  horarioRetirada: string
  dataDevolucao: string
  horarioDevolucao: string
  finalidade: string
  numeroArt?: string
  termoAceito?: boolean
}

export interface EquipamentoCompleto extends Omit<Equipamento, 'status'> {
  status: 'disponivel' | 'em_uso'
  especificacoes: string[]
  prazoMaximoDias: number
  exigeArtSisAnt: boolean
  exigeAprovacao: boolean
  diasSemana?: number[]
  horarioAbertura?: string
  horarioFechamento?: string
  horarioFuncionamento?: string
}

export interface RespostaSolicitacaoCriada {
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

export const equipamentoService = {
  async listar(signal?: AbortSignal): Promise<EquipamentoCompleto[]> {
    const { data } = await api.get<(Omit<EquipamentoCompleto, 'status'> & { status: 'EM_CAMPO' | 'DISPONIVEL' })[]>('/equipamentos', { signal })
    return data.map(item => ({
      ...item,
      status: item.status === 'EM_CAMPO' ? 'em_uso' : 'disponivel',
      especificacoes: item.especificacoes ?? [],
    }))
  },

  async solicitarEmprestimo(dados: CriarSolicitacaoEquipamentoDTO): Promise<RespostaSolicitacaoCriada> {
    const resposta = await api.post<RespostaSolicitacaoCriada>('/reservas', {
      tipo: 'equipamento',
      ...dados,
    })
    return resposta.data
  },
}
