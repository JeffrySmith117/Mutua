import api from './api'
import type { Equipamento, Reserva } from '../types'

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
  observacoes?: string
}

export interface EquipamentoCompleto extends Equipamento {
  especificacoes: string[]
  itensInclusos: string[]
  requisitosUso: string[]
  condicaoAtual: string
  tempoMaximoEmprestimo: string
}

// Catálogo institucional oficial do Crea Tec HUB — Mútua-PI
export const EQUIPAMENTOS_INICIAIS: EquipamentoCompleto[] = [
  {
    id: 'eq-drone-phantom-4-rtk',
    nome: 'Drone DJI Phantom 4 RTK',
    patrimonio: 'HUB-0042',
    categoria: 'Drones & Aerofotogrametria',
    status: 'disponivel',
    descricao:
      'Mapeamento aéreo e topografia de precisão centimétrica com módulo GNSS RTK integrado, ideal para aerofotogrametria, volumetria e vistorias de engenharia.',
    especificacoes: [
      'Sensor CMOS de 1 polegada e 20 Megapixels',
      'Obturador mecânico anti-rolling shutter',
      'Módulo GNSS multi-frequência (GPS, GLONASS, Galileo, BeiDou)',
      'Tempo de voo de até 30 minutos por bateria',
      'Alcance de transmissão de vídeo de até 7 km (HD)',
    ],
    itensInclusos: [
      'Maleta de transporte rígida estanque',
      'Controle remoto com tela ultra-brilhante integrada',
      '03 Baterias de voo inteligente',
      'Hub de recarga múltipla e cabos de alimentação',
      '02 Jogos de hélices de reposição',
    ],
    requisitosUso: [
      'Cadastro do operador ativo no SISANT / ANAC',
      'Abertura de voo no SARPAS / DECEA quando aplicável',
      'Termo de Responsabilidade e Guarda de Bens Móveis da Mútua-PI assinado',
    ],
    condicaoAtual: 'Excelente • Calibrado recentemente',
    tempoMaximoEmprestimo: 'Até 3 dias úteis consecutivos',
    ativo: true,
  },
  {
    id: 'eq-termografica-flir-e8',
    nome: 'Câmera Termográfica FLIR E8-XT',
    patrimonio: 'HUB-0019',
    categoria: 'Termografia & Inspeção Predial',
    status: 'disponivel',
    descricao:
      'Diagnóstico infravermelho de alta definição para inspeção de quadros de distribuição elétrica, sobrecargas, motores, infiltrações e patologias construtivas.',
    especificacoes: [
      'Resolução de infravermelho de 320 x 240 pixels (76.800 pontos)',
      'Tecnologia FLIR MSX para nitidez excepcional com contornos visuais',
      'Faixa de medição térmica de -20°C a 550°C',
      'Sensibilidade térmica inferior a 0,05°C',
      'Foco livre e lente grande-angular',
    ],
    itensInclusos: [
      'Maleta rígida para transporte seguro',
      'Fonte e carregador de bancada',
      'Cabo de comunicação USB de alta velocidade',
      'Certificado de calibração válido',
    ],
    requisitosUso: [
      'Uso exclusivo em atividades profissionais de engenharia',
      'Termo de Responsabilidade e Guarda assinado na retirada',
    ],
    condicaoAtual: 'Ótimo estado • Bateria com 100% de saúde',
    tempoMaximoEmprestimo: 'Até 4 dias úteis',
    ativo: true,
  },
  {
    id: 'eq-estacao-total-leica',
    nome: 'Estação Total Eletrônica Leica FlexLine TS07',
    patrimonio: 'HUB-0008',
    categoria: 'Topografia & Agrimensura',
    status: 'em_uso',
    descricao:
      'Instrumento de alta precisão angular e linear para demarcação de terrenos, loteamentos, obras civis de grande porte e locação de eixos de fundações.',
    especificacoes: [
      'Precisão angular de 2 segundos de arco',
      'Alcance de medição de até 500m sem prisma e 3.500m com prisma circular',
      'Compensador quádruplo de eixo eletrônico contínuo',
      'Software de bordo Leica FlexField com display colorido sensível ao toque',
    ],
    itensInclusos: [
      'Estojo de transporte acolchoado e resistente a impactos',
      'Tripé de madeira/alumínio reforçado',
      'Bastão telescópico de fibra de carbono com prisma',
      '02 Baterias de íons de lítio e carregador duplo',
    ],
    requisitosUso: [
      'Anotação de Responsabilidade Técnica (ART) vinculada ao serviço',
      'Previsão de retorno informada no ato da retirada',
    ],
    condicaoAtual: 'Em campo com associado • Devolução prevista para breve',
    tempoMaximoEmprestimo: 'Até 5 dias úteis',
    ativo: true,
  },
  {
    id: 'eq-gnss-rtk-comnav',
    nome: 'Par Receptor GNSS RTK ComNav T300 SE (Base + Rover)',
    patrimonio: 'HUB-0027',
    categoria: 'Topografia & Agrimensura',
    status: 'disponivel',
    descricao:
      'Sistema geodésico completo para georreferenciamento de imóveis rurais e urbanos certificado para normas do INCRA com link de rádio UHF interno e rede 4G.',
    especificacoes: [
      'Rastreio simultâneo de 965 canais multi-constelação',
      'Precisão milimétrica em modo estático e centimétrica em RTK',
      'Rádio interno UHF transceptor de 2W com alcance de até 5 km em linha de visada',
      'Modem celular 4G embutido para correções via NTRIP',
    ],
    itensInclusos: [
      '02 Receptores T300 SE (Base e Rover)',
      '01 Coletora de dados Android com software de campo instalado',
      '02 Tripés com base nivelante e 01 bastão com suporte',
      '04 Baterias recarregáveis e carregadores',
    ],
    requisitosUso: [
      'Profissional habilitado em Agrimensura ou Topografia cadastrado no CREA-PI',
      'Termo de responsabilidade técnica de transporte',
    ],
    condicaoAtual: 'Excelente • Pronto para uso em campo',
    tempoMaximoEmprestimo: 'Até 5 dias úteis',
    ativo: true,
  },
  {
    id: 'eq-esclerometro-schmidt',
    nome: 'Esclerômetro Digital para Concreto Schmidt Original Proceq',
    patrimonio: 'HUB-0033',
    categoria: 'Estruturas & Ensaios',
    status: 'disponivel',
    descricao:
      'Ensaio não-destrutivo para avaliação de dureza superficial e estimativa de resistência à compressão (fck) de elementos estruturais de concreto armado.',
    especificacoes: [
      'Energia de impacto padrão N (2,207 Nm)',
      'Faixa de resistência do concreto de 10 a 70 N/mm² (MPa)',
      'Display digital para leitura instantânea e cálculo de média automática',
      'Correção automática do ângulo de impacto',
    ],
    itensInclusos: [
      'Estojo rígido de proteção',
      'Pedra abrasiva para preparo e regularização da superfície',
      'Bigorna de calibração para conferência de precisão',
    ],
    requisitosUso: [
      'Termo de Responsabilidade assinado no balcão de atendimento',
      'Higienização e acondicionamento correto após os ensaios',
    ],
    condicaoAtual: 'Excelente estado de conservação',
    tempoMaximoEmprestimo: 'Até 3 dias úteis',
    ativo: true,
  },
  {
    id: 'eq-analisador-fluke',
    nome: 'Analisador de Qualidade de Energia Fluke 435 Série II',
    patrimonio: 'HUB-0015',
    categoria: 'Engenharia Elétrica & Eficiência',
    status: 'manutencao',
    descricao:
      'Análise aprofundada de distúrbios elétricos, harmônicos, flutuações de tensão e eficiência energética para instalações industriais e comerciais.',
    especificacoes: [
      'Conformidade integral com IEC 61000-4-30 Classe A',
      'Medição de 3 fases simultâneas mais neutro',
      'Calculadora de perda de energia em valores monetários',
      'Captura rápida de transientes de até 6 kV',
    ],
    itensInclusos: [
      '04 Garras de corrente flexíveis iFlex de até 6000A',
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
      return resposta.data
    } catch {
      // Fallback autônomo com filtros em memória
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
    }
  },

  async buscarPorId(id: string): Promise<EquipamentoCompleto | null> {
    try {
      const resposta = await api.get(`/equipamentos/${id}`)
      return resposta.data
    } catch {
      return EQUIPAMENTOS_INICIAIS.find((e) => e.id === id) || null
    }
  },

  async solicitarEmprestimo(dados: CriarSolicitacaoEquipamentoDTO): Promise<Reserva> {
    try {
      const resposta = await api.post<Reserva>('/reservas', {
        tipo: 'equipamento',
        ...dados,
      })
      return resposta.data
    } catch {
      // Criação simulada de reserva no armazenamento local
      const equipamento = EQUIPAMENTOS_INICIAIS.find((e) => e.id === dados.equipamentoId)
      const novaReserva: Reserva = {
        id: 'res-hub-' + Math.random().toString(36).substring(2, 9),
        usuarioId: 'usr-logado',
        tipo: 'equipamento',
        equipamentoId: dados.equipamentoId,
        equipamento: equipamento || undefined,
        dataInicio: `${dados.dataRetirada}T${dados.horarioRetirada}:00`,
        dataFim: `${dados.dataDevolucao}T${dados.horarioDevolucao}:00`,
        status: 'pendente',
        observacoes: dados.finalidade + (dados.numeroArt ? ` (ART: ${dados.numeroArt})` : ''),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }

      try {
        const reservasArmazenadas = JSON.parse(
          localStorage.getItem('@mutua:reservas_criadas') || '[]'
        )
        reservasArmazenadas.unshift(novaReserva)
        localStorage.setItem('@mutua:reservas_criadas', JSON.stringify(reservasArmazenadas))
      } catch {
        // Ignora erro de storage local
      }

      return novaReserva
    }
  },
}
