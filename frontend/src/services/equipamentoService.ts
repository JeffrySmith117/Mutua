import api from './api'
import type { Equipamento } from '../types'

export interface FiltrosEquipamentos {
  categoria?: string
  status?: string
  termoBusca?: string
}

export interface CriarSolicitacaoEquipamentoDTO {
  equipamentoId: string
  dataRetirada: string
  horarioRetirada: string
  dataDevolucao: string
  horarioDevolucao: string
  finalidade: string
  numeroArt?: string
}

export interface EquipamentoCompleto extends Equipamento {
  especificacoes: string[]
  itensInclusos: string[]
  requisitosUso: string[]
  condicaoAtual: string
  tempoMaximoEmprestimo: string
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

// Catálogo institucional de equipamentos tecnológicos de alta precisão
export const EQUIPAMENTOS_INICIAIS: EquipamentoCompleto[] = [
  {
    id: 'drone-dji-rtk',
    nome: 'Drone DJI Phantom 4 RTK + D-RTK 2',
    categoria: 'topografia',
    patrimonio: 'HUB-0042',
    status: 'disponivel',
    descricao:
      'Sistema completo de mapeamento aéreo com precisão centimétrica para levantamentos planialtimétricos, cálculo de volume e geração de ortofotos georreferenciadas.',
    especificacoes: [
      'Sensor CMOS 1" de 20 Megapixels com Obturador Mecânico',
      'Módulo RTK Integrado + Estação Base Móvel D-RTK 2',
      'Tempo de Voo: até 30 minutos por bateria (acompanha 3 baterias)',
      'Precisão horizontal RTK de 1 cm + 1 ppm',
    ],
    itensInclusos: [
      'Aeronave DJI Phantom 4 RTK',
      'Rádio controle com tela ultra-brilhante integrada',
      'Estação GNSS D-RTK 2 com tripé reforçado',
      '3 Baterias Inteligentes de Voo com Hub de Carregamento Rápido',
      'Maleta estanque rígida de transporte IP67',
    ],
    requisitosUso: [
      'Habilitação de piloto cadastrada no SISANT/ANAC ativa',
      'Seguro RETA obrigatório em dia',
      'Termo de responsabilidade e guarda com firma reconhecida/gov.br',
    ],
    condicaoAtual: 'Excelente estado de conservação • Calibração em dia (Out/2026)',
    tempoMaximoEmprestimo: 'Até 5 dias úteis corridos',
    ativo: true,
  },
  {
    id: 'estacao-total-leica',
    nome: 'Estação Total Leica FlexLine TS07 (1")',
    categoria: 'topografia',
    patrimonio: 'HUB-0008',
    status: 'em_uso',
    descricao:
      'Instrumento de alta acurácia angular para locação de obras civis complexas, monitoramento de estruturas e alinhamento geométrico de precisão industrial.',
    especificacoes: [
      'Precisão angular de 1 segundo (1")',
      'Alcance de medição sem prisma até 1.000 metros',
      'Compensador quádruplo contínuo automático',
      'Software embarcado Leica FlexField com exportação CAD/DXF',
    ],
    itensInclusos: [
      'Unidade central Leica TS07',
      'Tripé profissional de alta estabilidade em madeira/alumínio',
      'Bastão telescópico de fibra de carbono 2,15m',
      'Prisma circular com mira refletora e suporte basculante',
      '2 Baterias de íons de lítio com carregador bivolt inteligente',
    ],
    requisitosUso: [
      'Profissional registrado na câmara de agrimensura/civil com anuidade adimplente',
      'Assinatura de termo de caução institucional',
    ],
    condicaoAtual: 'Em operação em campo • Retorno previsto para 22/10/2026',
    tempoMaximoEmprestimo: 'Até 7 dias corridos',
    ativo: true,
  },
  {
    id: 'camera-termografica-flir',
    nome: 'Câmera Termográfica FLIR E8-XT WiFi',
    categoria: 'diagnostico',
    patrimonio: 'HUB-0019',
    status: 'disponivel',
    descricao:
      'Termovisor de nível pericial com tecnologia MSX para identificação de sobreaquecimento elétrico, patologias de infiltração oculta e perda de isolamento térmico.',
    especificacoes: [
      'Resolução térmica de 320 × 240 pixels (76.800 pontos de medição)',
      'Faixa de temperatura ampliada: -20°C a 550°C',
      'Tecnologia FLIR MSX (Realce dinâmico multiespectral)',
      'Conectividade Wi-Fi para transmissão imediata para laudos periciais',
    ],
    itensInclusos: [
      'Câmera térmica FLIR E8-XT',
      'Fonte carregadora com adaptador USB',
      'Bateria interna recarregável de longa duração',
      'Maleta rígida para transporte com espuma sob medida',
      'Certificado de calibração de fábrica válido',
    ],
    requisitosUso: [
      'Uso exclusivo em atividades de engenharia elétrica, mecânica ou civil',
      'Apresentação de ART da atividade/laudo pericial correspondente',
    ],
    condicaoAtual: 'Pronta para retirada imediata no balcão da sede',
    tempoMaximoEmprestimo: 'Até 3 dias úteis',
    ativo: true,
  },
  {
    id: 'esclerometro-digital-silver',
    nome: 'Esclerômetro Digital Proceq SilverSchmidt',
    categoria: 'diagnostico',
    patrimonio: 'HUB-0055',
    status: 'disponivel',
    descricao:
      'Martelo de reflexão digital para ensaios não destrutivos de resistência à compressão do concreto endurecido e homogeneidade estrutural.',
    especificacoes: [
      'Impacto de energia padrão Tipo N (2,207 Nm)',
      'Faixa de resistência do concreto: 10 a 100 N/mm² (MPa)',
      'Conversão direta com curvas de correlação normatizadas NBR 7584',
      'Memória interna para até 4.000 séries de impactos',
    ],
    itensInclusos: [
      'Esclerômetro SilverSchmidt Tipo N',
      'Bigorna de calibração padrão de conferência',
      'Pedra de carborundum para preparação da superfície',
      'Cabo de dados USB para download de medições',
      'Bolsa compacta de transporte com alça de ombro',
    ],
    requisitosUso: [
      'Profissional associado à Mútua com registro regular no CREA-PI',
    ],
    condicaoAtual: 'Calibrado e verificado com bigorna padrão',
    tempoMaximoEmprestimo: 'Até 2 dias úteis',
    ativo: true,
  },
  {
    id: 'detector-armaduras-ferroscan',
    nome: 'Pacômetro e Scanner de Armaduras Hilti PS 200',
    categoria: 'diagnostico',
    patrimonio: 'HUB-0027',
    status: 'disponivel',
    descricao:
      'Sistema de varredura não destrutiva para localização de vergalhões de aço, medição do cobrimento de concreto e estimativa de diâmetro de barras estruturais.',
    especificacoes: [
      'Profundidade de detecção de armaduras até 100 mm',
      'Determinação de diâmetro de barra de 6 mm a 36 mm',
      'Modo de varredura em malha para mapeamento de lajes e pilares',
      'Tela LCD colorida de alta visibilidade sob luz solar',
    ],
    itensInclusos: [
      'Scanner portátil Hilti Ferroscan',
      'Dispositivo de leitura de dados com display',
      'Papel de referência para escaneamento em malha',
      'Carregador e baterias recarregáveis sobressalentes',
    ],
    requisitosUso: [
      'Assinatura de termo de guarda com compromisso de ressarcimento em caso de avaria',
    ],
    condicaoAtual: 'Disponível na sede de Teresina',
    tempoMaximoEmprestimo: 'Até 3 dias úteis',
    ativo: true,
  },
  {
    id: 'analisador-energia-fluke',
    nome: 'Analisador de Qualidade de Energia Fluke 435-II',
    categoria: 'diagnostico',
    patrimonio: 'HUB-0063',
    status: 'manutencao',
    descricao:
      'Instrumento avançado para diagnóstico de transitórios, harmônicos, desequilíbrio de fases e perdas de eficiência energética em instalações industriais.',
    especificacoes: [
      'Medição de 3 fases e neutro em conformidade com IEC 61000-4-30 Classe A',
      'Cálculo de perda de energia em moeda corrente',
      'Captação de transitórios rápidos até 6 kV',
      'Software Fluke PowerLog para relatórios técnicos normatizados',
    ],
    itensInclusos: [
      'Analisador Fluke 435 Série II',
      '4 Garras de corrente flexíveis iFlex (alcance até 6.000A)',
      'Cabos de tensão e garras de teste tipo jacaré',
      'Software FlukeView para emissão de laudos técnicos',
    ],
    requisitosUso: [
      'Equipamento em calibração preventiva e aferição metrológica',
    ],
    condicaoAtual: 'Em manutenção preventiva e calibração periódica',
    tempoMaximoEmprestimo: 'Até 4 dias úteis',
    ativo: true,
  },
]

export const equipamentoService = {
  async listar(filtros?: FiltrosEquipamentos): Promise<EquipamentoCompleto[]> {
    try {
      const resposta = await api.get('/equipamentos', { params: filtros })
      if (Array.isArray(resposta.data) && resposta.data.length > 0) {
        return resposta.data
      }
    } catch {
      // Fallback para catálogo estático se a rota não estiver pronta
    }

    let filtrados = [...EQUIPAMENTOS_INICIAIS]

    if (filtros?.categoria && filtros.categoria !== 'todas') {
      filtrados = filtrados.filter((e) => e.categoria === filtros.categoria)
    }

    if (filtros?.status && filtros.status !== 'todos') {
      filtrados = filtrados.filter((e) => e.status === filtros.status)
    }

    if (filtros?.termoBusca) {
      const termo = filtros.termoBusca.toLowerCase()
      filtrados = filtrados.filter(
        (e) =>
          e.nome.toLowerCase().includes(termo) ||
          e.patrimonio.toLowerCase().includes(termo) ||
          e.categoria.toLowerCase().includes(termo) ||
          (e.descricao ? e.descricao.toLowerCase().includes(termo) : false) ||
          e.especificacoes.some((spec) => spec.toLowerCase().includes(termo))
      )
    }

    return filtrados
  },

  async buscarPorId(id: string): Promise<EquipamentoCompleto | null> {
    try {
      const resposta = await api.get(`/equipamentos/${id}`)
      return resposta.data
    } catch {
      return EQUIPAMENTOS_INICIAIS.find((e) => e.id === id) || null
    }
  },

  /**
   * Solicita empréstimo de equipamento no backend. D01: Propaga erros reais (ex: conflito, validação).
   */
  async solicitarEmprestimo(dados: CriarSolicitacaoEquipamentoDTO): Promise<RespostaSolicitacaoCriada> {
    const resposta = await api.post<RespostaSolicitacaoCriada>('/reservas', {
      tipo: 'equipamento',
      ...dados,
    })
    return resposta.data
  },
}
