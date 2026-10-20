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

// Dados simulados da administração da Mútua-PI
const SOLICITACOES_MOCK: SolicitacaoPendente[] = [
  {
    id: 'sol-1',
    protocolo: 'HUB-2026-0112',
    tipo: 'equipamento',
    itemNome: 'Drone DJI Phantom 4 RTK',
    patrimonioOuLocal: 'Patrimônio: HUB-0042',
    profissionalNome: 'Elias Pio Mendes',
    registroCrea: 'CREA-PI 32415/D',
    cpf: '123.456.789-00',
    dataInicio: '2026-10-24T08:30:00',
    dataFim: '2026-10-26T17:00:00',
    finalidade: 'Levantamento planialtimétrico cadastral para projeto de regularização fundiária.',
    documentoVinculado: 'ART: PI2026008491 • Cadastro SISANT: 412850-BR',
    status: 'pendente',
    criadoEm: '2026-10-19T14:20:00',
  },
  {
    id: 'sol-2',
    protocolo: 'MUT-2026-0915',
    tipo: 'ambiente',
    itemNome: 'Auditório Master Cláudio Portella',
    patrimonioOuLocal: '3º Andar • Sede Mútua-PI',
    profissionalNome: 'Eng. Valéria Sampaio Fontenele',
    registroCrea: 'CREA-PI 18942/D',
    cpf: '321.654.987-11',
    dataInicio: '2026-10-28T08:00:00',
    dataFim: '2026-10-28T18:00:00',
    finalidade: 'Seminário Estadual de Infraestrutura e Pavimentação Asfáltica Sustentável.',
    documentoVinculado: 'Programação Oficial Anexa • Estimativa de 55 inscritos',
    status: 'pendente',
    criadoEm: '2026-10-18T16:00:00',
  },
  {
    id: 'sol-3',
    protocolo: 'HUB-2026-0144',
    tipo: 'equipamento',
    itemNome: 'Par Receptor GNSS RTK ComNav T300 SE',
    patrimonioOuLocal: 'Patrimônio: HUB-0027',
    profissionalNome: 'Eng. Agrimensor Raimundo Nonato',
    registroCrea: 'CREA-PI 27610/D',
    cpf: '987.123.456-88',
    dataInicio: '2026-10-25T08:30:00',
    dataFim: '2026-10-29T17:00:00',
    finalidade: 'Georreferenciamento de propriedade rural em Uruçuí-PI pelo INCRA.',
    documentoVinculado: 'ART nº 2026/09941 de Agrimensura',
    status: 'pendente',
    criadoEm: '2026-10-20T09:10:00',
  },
]

const MOVIMENTACOES_MOCK: MovimentacaoBalcao[] = [
  {
    id: 'mov-1',
    protocolo: 'HUB-2026-0008',
    equipamentoNome: 'Estação Total Eletrônica Leica FlexLine TS07',
    patrimonio: 'HUB-0008',
    profissionalNome: 'Eng. Marcelo Cavalcante de Melo',
    registroCrea: 'CREA-PI 15420/D',
    dataRetirada: '2026-10-17T09:00:00',
    dataDevolucaoPrevista: '2026-10-22T17:00:00',
    condicaoRetirada: 'otimo',
    statusMovimentacao: 'em_campo',
    observacoes: 'Acompanha tripé de alumínio, bastão e 2 baterias carregadas.',
  },
  {
    id: 'mov-2',
    protocolo: 'HUB-2026-0019',
    equipamentoNome: 'Câmera Termográfica FLIR E8-XT',
    patrimonio: 'HUB-0019',
    profissionalNome: 'Elias Pio Mendes',
    registroCrea: 'CREA-PI 32415/D',
    dataRetirada: '2026-10-05T08:30:00',
    dataDevolucaoPrevista: '2026-10-07T17:00:00',
    dataDevolucaoEfetiva: '2026-10-07T16:45:00',
    condicaoRetirada: 'otimo',
    condicaoDevolucao: 'otimo',
    statusMovimentacao: 'devolvido',
    observacoes: 'Equipamento devolvido íntegro e testado no balcão.',
  },
]

export const adminService = {
  async listarPendencias(): Promise<SolicitacaoPendente[]> {
    try {
      const resposta = await api.get<SolicitacaoPendente[]>('/admin/pendencias')
      return resposta.data
    } catch {
      return SOLICITACOES_MOCK
    }
  },

  async listarMovimentacoes(): Promise<MovimentacaoBalcao[]> {
    try {
      const resposta = await api.get<MovimentacaoBalcao[]>('/admin/movimentacoes')
      return resposta.data
    } catch {
      return MOVIMENTACOES_MOCK
    }
  },

  async aprovarSolicitacao(id: string, observacao?: string): Promise<boolean> {
    try {
      await api.post(`/admin/pendencias/${id}/aprovar`, { observacao })
      return true
    } catch {
      return true
    }
  },

  async recusarSolicitacao(id: string, motivo: string): Promise<boolean> {
    try {
      await api.post(`/admin/pendencias/${id}/recusar`, { motivo })
      return true
    } catch {
      return true
    }
  },

  async registrarRetirada(
    id: string,
    condicao: CondicaoEquipamento,
    observacao?: string
  ): Promise<boolean> {
    try {
      await api.post(`/admin/movimentacoes/${id}/retirar`, { condicao, observacao })
      return true
    } catch {
      return true
    }
  },

  async registrarDevolucao(
    id: string,
    condicao: CondicaoEquipamento,
    observacao?: string
  ): Promise<boolean> {
    try {
      await api.post(`/admin/movimentacoes/${id}/devolver`, { condicao, observacao })
      return true
    } catch {
      return true
    }
  },

  async obterMetricas(): Promise<MetricasAdmin> {
    try {
      const resposta = await api.get<MetricasAdmin>('/admin/metricas')
      return resposta.data
    } catch {
      return {
        solicitacoesPendentes: 3,
        equipamentosEmCampo: 1,
        taxaOcupacaoSalas: '82%',
        totalReservasMes: 47,
        profissionaisAtivos: 312,
      }
    }
  },
}
