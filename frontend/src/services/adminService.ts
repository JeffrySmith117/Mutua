import api from './api'
import type { CondicaoEquipamento } from '../types'

export interface SolicitacaoPendente {
  id: string
  protocolo: string
  tipo: 'ambiente' | 'equipamento'
  itemNome: string
  patrimonioOuLocal: string
  profissionalNome: string
  registroCrea: string
  cpf: string
  dataInicio: string
  dataFim: string
  finalidade: string
  documentoVinculado?: string
  status: 'pendente' | 'aprovada' | 'recusada' | 'em_campo' | 'concluida'
  criadoEm: string
}

export interface MovimentacaoBalcao {
  id: string
  protocolo: string
  equipamentoNome: string
  patrimonio: string
  profissionalNome: string
  registroCrea: string
  dataRetirada?: string
  dataDevolucaoPrevista: string
  dataDevolucaoEfetiva?: string
  condicaoRetirada: CondicaoEquipamento
  condicaoDevolucao?: CondicaoEquipamento
  statusMovimentacao: 'aguardando_retirada' | 'em_campo' | 'devolvido' | 'avaria_registrada'
  observacoes?: string
}

export interface MetricasAdmin {
  solicitacoesPendentes: number
  equipamentosEmCampo: number
  taxaOcupacaoSalas: string
  totalReservasMes: number
  profissionaisAtivos: number
}

export type StatusHistorico = 'concluida' | 'cancelada' | 'recusada' | 'em_uso'
export type TipoRecursoHistorico = 'todos' | 'ambiente' | 'equipamento'

export interface EventoLinhaTempo {
  titulo: string
  dataHora: string
  responsavel: string
  descricao: string
  tipo: 'solicitacao' | 'aprovacao' | 'retirada' | 'devolucao' | 'cancelamento' | 'recusa'
}

export interface RegistroHistorico {
  id: string
  protocolo: string
  tipo: 'ambiente' | 'equipamento'
  recursoNome: string
  patrimonioOuLocal: string
  profissionalNome: string
  registroCrea: string
  cpfMascarado: string
  dataInicio: string
  dataFim: string
  status: StatusHistorico
  motivoCancelamentoOuRecusa?: string
  dadosBalcao?: {
    retiradoEm?: string
    devolvidoEm?: string
    condicaoRetirada?: CondicaoEquipamento
    condicaoDevolucao?: CondicaoEquipamento
    atendenteBalcao: string
    observacoes?: string
    itensConferidos?: string[]
  }
  finalidade: string
  linhaDoTempo: EventoLinhaTempo[]
}

export type TipoRecursoInventario = 'COWORKING' | 'SALA' | 'AUDITORIO' | 'EQUIPAMENTO'

export interface DadosRecurso {
  nome: string
  tipo: TipoRecursoInventario
  patrimonio?: string | null
  localizacao?: string | null
  descricao?: string | null
  categoria?: string | null
  capacidade?: number
  prazoMaxDias?: number
  exigeAprovacao: boolean
  exigeArtSisant?: boolean
  horarioAbertura: string
  horarioFechamento: string
  diasSemana: number[]
  recursosDisponiveis?: string[]
  especificacoes?: string[]
}

export interface RecursoInventario extends DadosRecurso {
  id: string
  ativo: boolean
}

export interface FiltrosHistorico {
  busca?: string
  tipo?: TipoRecursoHistorico
  status?: 'todos' | StatusHistorico
  dataInicio?: string
  dataFim?: string
}

export const adminService = {
  async listarRecursos(): Promise<RecursoInventario[]> {
    const { data } = await api.get<RecursoInventario[]>('/admin/recursos')
    return data
  },

  async criarRecurso(dados: DadosRecurso): Promise<RecursoInventario> {
    const { data } = await api.post<RecursoInventario>('/admin/recursos', dados)
    return data
  },

  async atualizarRecurso(id: string, dados: DadosRecurso): Promise<RecursoInventario> {
    const { data } = await api.put<RecursoInventario>(`/admin/recursos/${id}`, dados)
    return data
  },

  async definirRecursoAtivo(id: string, ativo: boolean): Promise<RecursoInventario> {
    const { data } = await api.patch<RecursoInventario>(`/admin/recursos/${id}/ativo`, { ativo })
    return data
  },

  async listarPendencias(): Promise<SolicitacaoPendente[]> {
    const { data } = await api.get<SolicitacaoPendente[]>(`/admin/pendencias`)
    return data
  },

  async listarMovimentacoes(): Promise<MovimentacaoBalcao[]> {
    const { data } = await api.get<MovimentacaoBalcao[]>(`/admin/movimentacoes`)
    return data
  },

  async aprovarSolicitacao(id: string, observacao?: string): Promise<boolean> {
    await api.post(`/admin/pendencias/${id}/aprovar`, { observacao })
    return true
  },

  async recusarSolicitacao(id: string, motivo: string): Promise<boolean> {
    await api.post(`/admin/pendencias/${id}/recusar`, { motivo })
    return true
  },

  async registrarRetirada(
    id: string,
    condicao: CondicaoEquipamento,
    observacao?: string
  ): Promise<boolean> {
    await api.post(`/admin/movimentacoes/${id}/retirar`, { condicao, observacao })
    return true
  },

  async registrarDevolucao(
    id: string,
    condicao: CondicaoEquipamento,
    observacao?: string
  ): Promise<boolean> {
    await api.post(`/admin/movimentacoes/${id}/devolver`, { condicao, observacao })
    return true
  },

  async obterMetricas(): Promise<MetricasAdmin> {
    const { data } = await api.get<MetricasAdmin>(`/admin/metricas`)
    return data
  },

  async listarHistorico(): Promise<RegistroHistorico[]> {
    const { data } = await api.get<RegistroHistorico[]>(`/admin/historico`)
    return data
  },

  async obterHistoricoPorId(id: string): Promise<RegistroHistorico> {
    const { data } = await api.get<RegistroHistorico>(`/admin/historico/${id}`)
    return data
  },
}
