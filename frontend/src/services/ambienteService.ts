import api from './api'
import type { Ambiente } from '../types'

export interface FiltrosAmbientes {
  tipo?: string
  capacidadeMinima?: number
  termoBusca?: string
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

// Lista rica de espaços institucionais na sede da Mútua-PI / CREA-PI
export const AMBIENTES_INICIAIS: (Ambiente & {
  recursos: string[]
  horarioFuncionamento: string
  localizacao: string
  regrasUso: string[]
})[] = [
  {
    id: 'coworking-master',
    nome: 'Espaço Coworking Compartilhado',
    tipo: 'coworking',
    capacidade: 24,
    descricao:
      'Estações de trabalho ergonômicas equipadas para profissionais da engenharia e agronomia realizarem projetos com conforto, foco e networking.',
    recursos: [
      'Wi-Fi 6 de Alta Velocidade',
      'Climatização Central',
      'Tomadas e USB Individuais',
      'Café Gourmet e Água Inclusos',
      'Cabines Telefônicas para Chamadas Rápidas',
      'Acessibilidade Total',
    ],
    horarioFuncionamento: '08:00 às 18:00 (Segunda a Sexta)',
    localizacao: 'Térreo • Ala Sul • Sede Mútua-PI',
    regrasUso: [
      'Benefício gratuito de até 40h mensais por associado em dia',
      'Respeitar o silêncio e tom moderado de voz nas áreas compartilhadas',
      'Uso de fones de ouvido para reuniões virtuais',
    ],
    ativo: true,
  },
  {
    id: 'sala-reuniao-executiva-a',
    nome: 'Sala de Reuniões Executiva A',
    tipo: 'sala_reuniao',
    capacidade: 8,
    descricao:
      'Sala privativa com tratamento acústico de alto padrão, projetada para alinhamentos estratégicos, apresentação de laudos e reuniões de clientes.',
    recursos: [
      'Smart TV 65" 4K com Apple AirPlay e HDMI',
      'Câmera Ultra-Wide para Videoconferência com Microfone Integrado',
      'Lousa de Vidro com Marcadores',
      'Ar-condicionado Silencioso',
      'Mesa de Reunião com Caixa de Conectividade Embutida',
    ],
    horarioFuncionamento: '08:00 às 18:00 (Blocos de 1h a 4h)',
    localizacao: '2º Andar • Sala 204 • Sede Mútua-PI',
    regrasUso: [
      'Tolerância máxima de 15 minutos para início do uso',
      'Cancelamento com no mínimo 2 horas de antecedência',
      'Permitido levar até 7 convidados externos',
    ],
    ativo: true,
  },
  {
    id: 'sala-reuniao-executiva-b',
    nome: 'Sala de Reuniões Executiva B',
    tipo: 'sala_reuniao',
    capacidade: 6,
    descricao:
      'Espaço aconchegante para reuniões ágeis, brainstormings e consultorias individuais entre profissionais e contratantes.',
    recursos: [
      'Smart TV 55" 4K',
      'Videoconferência Integrada',
      'Ar-condicionado Inverter',
      'Quadro Branco Magnético',
      'Wi-Fi Dedicado',
    ],
    horarioFuncionamento: '08:00 às 18:00 (Blocos de 1h a 3h)',
    localizacao: '2º Andar • Sala 206 • Sede Mútua-PI',
    regrasUso: [
      'Cancelamento com no mínimo 2 horas de antecedência',
      'Zelo pelos equipamentos e cabos disponibilizados',
    ],
    ativo: true,
  },
  {
    id: 'sala-multiuso-treinamentos',
    nome: 'Sala Multiuso & Treinamentos',
    tipo: 'sala_multiuso',
    capacidade: 16,
    descricao:
      'Espaço modulável perfeito para cursos técnicos, workshops, palestras de curta duração e reuniões de comissões temáticas.',
    recursos: [
      'Projetor Laser Full HD com Telão Retrátil',
      'Sistema de Som com Microfones Sem Fio',
      'Mesas e Cadeiras Reconfiguráveis',
      'Púlpito de Apresentação',
      'Ar-condicionado de Alta Capacidade',
    ],
    horarioFuncionamento: '08:00 às 18:00 (Blocos de 2h a 6h)',
    localizacao: '1º Andar • Sala 102 • Sede Mútua-PI',
    regrasUso: [
      'Exige detalhamento do evento no ato do agendamento',
      'Sujeito a aprovação prévia da diretoria',
    ],
    ativo: true,
  },
  {
    id: 'auditorio-institucional',
    nome: 'Auditório Master da Engenharia',
    tipo: 'auditorio',
    capacidade: 60,
    descricao:
      'Estrutura completa para conferências magnas, assembleias associativas e simpósios técnicos estaduais do sistema Confea/CREA.',
    recursos: [
      'Painel de LED de Alta Definição',
      'Mesa de Controle de Áudio Profissional',
      'Cabine de Transmissão Online / Live Streaming',
      'Poltronas Acolchoadas com Prancheta Embutida',
      'Foyer de Recepção para Coffee Break',
    ],
    horarioFuncionamento: 'Turno Matutino ou Vespertino',
    localizacao: 'Subsolo • Acesso Principal • Sede Mútua-PI',
    regrasUso: [
      'Agendamento sujeito à validação da gerência executiva',
      'Solicitar com pelo menos 5 dias úteis de antecedência',
    ],
    ativo: true,
  },
]

export const ambienteService = {
  async listar(filtros?: FiltrosAmbientes): Promise<typeof AMBIENTES_INICIAIS> {
    try {
      const resposta = await api.get('/ambientes', { params: filtros })
      if (Array.isArray(resposta.data) && resposta.data.length > 0) {
        return resposta.data
      }
    } catch {
      // Fallback para catálogo estático apenas se o backend ainda não tiver a rota /ambientes implementada
    }

    let filtrados = [...AMBIENTES_INICIAIS]

    if (filtros?.tipo && filtros.tipo !== 'todos') {
      filtrados = filtrados.filter((a) => a.tipo === filtros.tipo)
    }

    if (filtros?.capacidadeMinima) {
      filtrados = filtrados.filter((a) => a.capacidade >= filtros.capacidadeMinima!)
    }

    if (filtros?.termoBusca) {
      const termo = filtros.termoBusca.toLowerCase()
      filtrados = filtrados.filter(
        (a) =>
          a.nome.toLowerCase().includes(termo) ||
          (a.descricao ? a.descricao.toLowerCase().includes(termo) : false) ||
          a.recursos.some((r) => r.toLowerCase().includes(termo))
      )
    }

    return filtrados
  },

  async buscarPorId(id: string) {
    try {
      const resposta = await api.get(`/ambientes/${id}`)
      return resposta.data
    } catch {
      return AMBIENTES_INICIAIS.find((a) => a.id === id) || null
    }
  },

  /**
   * Registra a reserva no backend. D01: Propaga erros reais (ex: 409 conflito, 400 validação).
   */
  async reservar(dados: CriarReservaAmbienteDTO): Promise<RespostaReservaCriada> {
    const resposta = await api.post<RespostaReservaCriada>('/reservas', {
      tipo: 'ambiente',
      ...dados,
    })
    return resposta.data
  },
}
