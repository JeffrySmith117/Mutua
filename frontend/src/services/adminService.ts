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

export interface FiltrosHistorico {
  busca?: string
  tipo?: TipoRecursoHistorico
  status?: 'todos' | StatusHistorico
  dataInicio?: string
  dataFim?: string
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

const HISTORICO_MOCK: RegistroHistorico[] = [
  {
    id: 'hist-1',
    protocolo: 'HUB-2026-0042',
    tipo: 'equipamento',
    recursoNome: 'Drone DJI Phantom 4 RTK',
    patrimonioOuLocal: 'HUB-0042',
    profissionalNome: 'Eng. Agrimensor Carlos Eduardo Vieira',
    registroCrea: 'CREA-PI 22419/D',
    cpfMascarado: '***.456.789-**',
    dataInicio: '2026-10-10T08:00:00',
    dataFim: '2026-10-13T17:00:00',
    status: 'concluida',
    finalidade: 'Levantamento topográfico para implantação de parque de energia solar em Bom Jesus-PI.',
    dadosBalcao: {
      retiradoEm: '2026-10-10T08:25:00',
      devolvidoEm: '2026-10-13T16:40:00',
      condicaoRetirada: 'otimo',
      condicaoDevolucao: 'otimo',
      atendenteBalcao: 'Secretaria Mútua-PI / Ana Beatriz',
      observacoes: 'Equipamento devolvido com 3 baterias carregadas, lentes higienizadas e maleta intacta.',
      itensConferidos: [
        'Aeronave DJI Phantom 4 RTK',
        'Controle remoto com display integrado',
        '3 Baterias de voo inteligente + Hub de recarga',
        'Estação D-RTK 2 + Tripé geodésico',
      ],
    },
    linhaDoTempo: [
      {
        titulo: 'Solicitação de Empréstimo',
        dataHora: '2026-10-06T11:20:00',
        responsavel: 'Eng. Carlos Eduardo Vieira',
        descricao: 'Submetida solicitação com ART vinculada nº PI2026/04112.',
        tipo: 'solicitacao',
      },
      {
        titulo: 'Aprovação pela Diretoria',
        dataHora: '2026-10-07T14:10:00',
        responsavel: 'Diretoria Mútua-PI',
        descricao: 'Parecer técnico favorável. Termo de responsabilidade gerado.',
        tipo: 'aprovacao',
      },
      {
        titulo: 'Retirada no Balcão HUB',
        dataHora: '2026-10-10T08:25:00',
        responsavel: 'Ana Beatriz (Atendente Mútua)',
        descricao: 'Assinatura física do termo e checklist de integridade concluído em estado ótimo.',
        tipo: 'retirada',
      },
      {
        titulo: 'Devolução e Vistoria Final',
        dataHora: '2026-10-13T16:40:00',
        responsavel: 'Ana Beatriz (Atendente Mútua)',
        descricao: 'Vistoria presencial sem avarias constatadas. Devolução homologada.',
        tipo: 'devolucao',
      },
    ],
  },
  {
    id: 'hist-2',
    protocolo: 'MUT-2026-0814',
    tipo: 'ambiente',
    recursoNome: 'Auditório Master Cláudio Portella',
    patrimonioOuLocal: '3º Andar • Sede Mútua-PI',
    profissionalNome: 'Eng. Civil Valéria Sampaio Fontenele',
    registroCrea: 'CREA-PI 18942/D',
    cpfMascarado: '***.654.987-**',
    dataInicio: '2026-10-14T08:00:00',
    dataFim: '2026-10-14T18:00:00',
    status: 'concluida',
    finalidade: 'Workshop Técnico: Novas Normas Regulamentadoras da Construção Civil e Descarbonização.',
    linhaDoTempo: [
      {
        titulo: 'Agendamento Institucional',
        dataHora: '2026-10-01T09:15:00',
        responsavel: 'Eng. Valéria Sampaio',
        descricao: 'Reserva solicitada para 50 participantes.',
        tipo: 'solicitacao',
      },
      {
        titulo: 'Aprovação pela Gestão de Espaços',
        dataHora: '2026-10-02T10:00:00',
        responsavel: 'Gestor da Sede Mútua-PI',
        descricao: 'Disponibilidade de recursos audiovisuais e ar-condicionado confirmada.',
        tipo: 'aprovacao',
      },
      {
        titulo: 'Evento Realizado com Sucesso',
        dataHora: '2026-10-14T18:00:00',
        responsavel: 'Portaria & Secretaria Mútua-PI',
        descricao: 'Espaço desocupado e vistoriado sem intercorrências.',
        tipo: 'devolucao',
      },
    ],
  },
  {
    id: 'hist-3',
    protocolo: 'HUB-2026-0008',
    tipo: 'equipamento',
    recursoNome: 'Estação Total Leica FlexLine TS07',
    patrimonioOuLocal: 'HUB-0008',
    profissionalNome: 'Eng. Marcelo Cavalcante de Melo',
    registroCrea: 'CREA-PI 15420/D',
    cpfMascarado: '***.332.118-**',
    dataInicio: '2026-10-17T09:00:00',
    dataFim: '2026-10-22T17:00:00',
    status: 'em_uso',
    finalidade: 'Locação de fundações profundas em empreendimento hospitalar em Teresina-PI.',
    dadosBalcao: {
      retiradoEm: '2026-10-17T09:00:00',
      condicaoRetirada: 'otimo',
      atendenteBalcao: 'Secretaria Mútua-PI / Marcos Vinicius',
      observacoes: 'Acompanha tripé de alumínio, bastão de fibra e 2 baterias recarregadas.',
      itensConferidos: [
        'Unidade central Leica TS07 com maleta',
        'Carregador bivolt original e cabos',
        'Tripé de alta rigidez Leica',
        'Prisma circular com mira refletora',
      ],
    },
    linhaDoTempo: [
      {
        titulo: 'Solicitação do Equipamento',
        dataHora: '2026-10-14T16:00:00',
        responsavel: 'Eng. Marcelo Cavalcante',
        descricao: 'Reserva aprovada automaticamente com anuidade regular.',
        tipo: 'solicitacao',
      },
      {
        titulo: 'Retirada e Emissão de Termo de Guarda',
        dataHora: '2026-10-17T09:00:00',
        responsavel: 'Marcos Vinicius (Balcão HUB)',
        descricao: 'Equipamento entregue em campo. Retorno previsto para 22/10.',
        tipo: 'retirada',
      },
    ],
  },
  {
    id: 'hist-4',
    protocolo: 'MUT-2026-0792',
    tipo: 'ambiente',
    recursoNome: 'Espaço Coworking Compartilhado (Estação 06)',
    patrimonioOuLocal: 'Térreo • Ala Sul Sede Mútua-PI',
    profissionalNome: 'Eng. Eletricista Lucas Meneses Rocha',
    registroCrea: 'CREA-PI 31092/D',
    cpfMascarado: '***.889.441-**',
    dataInicio: '2026-10-16T14:00:00',
    dataFim: '2026-10-16T18:00:00',
    status: 'concluida',
    finalidade: 'Elaboração de projetos de subestação e atendimento a cliente institucional.',
    linhaDoTempo: [
      {
        titulo: 'Check-in Realizado via Sistema',
        dataHora: '2026-10-16T13:58:00',
        responsavel: 'Eng. Lucas Meneses',
        descricao: 'Confirmação presencial efetuada na recepção.',
        tipo: 'solicitacao',
      },
      {
        titulo: 'Utilização Concluída',
        dataHora: '2026-10-16T18:02:00',
        responsavel: 'Sistema de Acesso Mútua-PI',
        descricao: 'Período encerrado pontualmente.',
        tipo: 'devolucao',
      },
    ],
  },
  {
    id: 'hist-5',
    protocolo: 'HUB-2026-0019',
    tipo: 'equipamento',
    recursoNome: 'Câmera Termográfica FLIR E8-XT',
    patrimonioOuLocal: 'HUB-0019',
    profissionalNome: 'Eng. Mecânico Elias Pio Mendes',
    registroCrea: 'CREA-PI 32415/D',
    cpfMascarado: '***.456.789-**',
    dataInicio: '2026-10-05T08:30:00',
    dataFim: '2026-10-07T17:00:00',
    status: 'concluida',
    finalidade: 'Perícia térmica preventiva em quadros elétricos de comando industrial.',
    dadosBalcao: {
      retiradoEm: '2026-10-05T08:30:00',
      devolvidoEm: '2026-10-07T16:45:00',
      condicaoRetirada: 'otimo',
      condicaoDevolucao: 'otimo',
      atendenteBalcao: 'Ana Beatriz (Atendente Mútua)',
      observacoes: 'Devolução com certificado de calibração conferido.',
      itensConferidos: [
        'Câmera Térmica FLIR E8-XT',
        'Fonte carregadora USB',
        'Cabo de comunicação',
        'Maleta rígida de transporte',
      ],
    },
    linhaDoTempo: [
      {
        titulo: 'Solicitação Registrada',
        dataHora: '2026-10-02T10:00:00',
        responsavel: 'Eng. Elias Pio Mendes',
        descricao: 'Finalidade pericial cadastrada com ART vinculada.',
        tipo: 'solicitacao',
      },
      {
        titulo: 'Despacho Favorável',
        dataHora: '2026-10-02T15:30:00',
        responsavel: 'Diretoria Mútua-PI',
        descricao: 'Empréstimo autorizado.',
        tipo: 'aprovacao',
      },
      {
        titulo: 'Retirada em Balcão',
        dataHora: '2026-10-05T08:30:00',
        responsavel: 'Ana Beatriz',
        descricao: 'Checklist concluído.',
        tipo: 'retirada',
      },
      {
        titulo: 'Devolução Concluída',
        dataHora: '2026-10-07T16:45:00',
        responsavel: 'Ana Beatriz',
        descricao: 'Equipamento devolvido íntegro e testado no balcão.',
        tipo: 'devolucao',
      },
    ],
  },
  {
    id: 'hist-6',
    protocolo: 'HUB-2026-0099',
    tipo: 'equipamento',
    recursoNome: 'Medidor de Pressão Sonora Tipo 1',
    patrimonioOuLocal: 'HUB-0033',
    profissionalNome: 'Eng. de Segurança Roberto Albuquerque',
    registroCrea: 'CREA-PI 19840/D',
    cpfMascarado: '***.112.556-**',
    dataInicio: '2026-10-08T09:00:00',
    dataFim: '2026-10-09T18:00:00',
    status: 'cancelada',
    motivoCancelamentoOuRecusa: 'Cancelado pelo solicitante devido ao adiamento da medição de ruído da obra.',
    finalidade: 'Avaliação de ruído ocupacional em canteiro de obras conforme NHO-01.',
    linhaDoTempo: [
      {
        titulo: 'Reserva Solicitada',
        dataHora: '2026-10-04T08:30:00',
        responsavel: 'Eng. Roberto Albuquerque',
        descricao: 'Solicitação inicial de empréstimo.',
        tipo: 'solicitacao',
      },
      {
        titulo: 'Cancelamento pelo Profissional',
        dataHora: '2026-10-06T17:15:00',
        responsavel: 'Eng. Roberto Albuquerque',
        descricao: 'O associado cancelou com mais de 24h de antecedência. Horário liberado.',
        tipo: 'cancelamento',
      },
    ],
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

  async listarHistorico(filtros?: FiltrosHistorico): Promise<RegistroHistorico[]> {
    try {
      const resposta = await api.get<RegistroHistorico[]>('/admin/historico', { params: filtros })
      return resposta.data
    } catch {
      let resultado = [...HISTORICO_MOCK]
      if (!filtros) return resultado

      if (filtros.busca) {
        const termo = filtros.busca.toLowerCase().trim()
        resultado = resultado.filter(
          (r) =>
            r.profissionalNome.toLowerCase().includes(termo) ||
            r.registroCrea.toLowerCase().includes(termo) ||
            r.recursoNome.toLowerCase().includes(termo) ||
            r.patrimonioOuLocal.toLowerCase().includes(termo) ||
            r.protocolo.toLowerCase().includes(termo)
        )
      }

      if (filtros.tipo && filtros.tipo !== 'todos') {
        resultado = resultado.filter((r) => r.tipo === filtros.tipo)
      }

      if (filtros.status && filtros.status !== 'todos') {
        resultado = resultado.filter((r) => r.status === filtros.status)
      }

      if (filtros.dataInicio) {
        resultado = resultado.filter((r) => r.dataInicio >= filtros.dataInicio!)
      }

      if (filtros.dataFim) {
        resultado = resultado.filter((r) => r.dataFim <= filtros.dataFim!)
      }

      return resultado
    }
  },

  async obterHistoricoPorId(id: string): Promise<RegistroHistorico | null> {
    try {
      const resposta = await api.get<RegistroHistorico>(`/admin/historico/${id}`)
      return resposta.data
    } catch {
      return HISTORICO_MOCK.find((r) => r.id === id) || null
    }
  },
}
