import api from './api'
import type { Ambiente, Reserva } from '../types'

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
      'Ambiente flexível com mesas modulares, preparado para capacitações técnicas, cursos de softwares de engenharia e reuniões de câmaras técnicas.',
    recursos: [
      'Projetor Interativo Full HD',
      'Mesas Modulares com Rodízios e Travas',
      'Quadro Branco Amplo de 3 Metros',
      'Pontos de Rede Cabeada Gigabit para Laptops',
      'Sistema de Caixas Acústicas Embutidas no Teto',
    ],
    horarioFuncionamento: '08:00 às 17:30 (Turnos Matutino ou Vespertino)',
    localizacao: '1º Andar • Ala Técnica • Sede Mútua-PI',
    regrasUso: [
      'Reserva mediante solicitação com 48h de antecedência',
      'Organizar a disposição das mesas e cadeiras após o término',
    ],
    ativo: true,
  },
  {
    id: 'auditorio-claudio-portella',
    nome: 'Auditório Master Cláudio Portella',
    tipo: 'auditorio',
    capacidade: 60,
    descricao:
      'O principal espaço solene da Mútua-PI para congressos, palestras magnas, seminários de engenharia e eventos institucionais do CREA-PI.',
    recursos: [
      'Projetor Laser de Alta Luminosidade 6000 Lumens',
      'Mesa de Som Profissional com 4 Microfones Sem Fio',
      'Palco Elevado com Púlpito e Mesa Diretiva',
      'Cabine de Controle Técnico de Áudio e Iluminação',
      'Foyer para Coffee Break e Credenciamento',
      'Acessibilidade com Elevador Dedicado',
    ],
    horarioFuncionamento: '08:00 às 21:00 (Turno Completo ou Noite)',
    localizacao: '3º Andar • Sede Mútua-PI',
    regrasUso: [
      'Sujeito à aprovação da diretoria da Mútua-PI',
      'Necessário envio de programação oficial do evento',
      'Presença de operador técnico recomendada',
    ],
    ativo: true,
  },
]

export const ambienteService = {
  async listar(filtros?: FiltrosAmbientes): Promise<typeof AMBIENTES_INICIAIS> {
    try {
      const resposta = await api.get('/ambientes', { params: filtros })
      return resposta.data
    } catch {
      // Fallback autônomo com filtros em memória
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
    }
  },

  async buscarPorId(id: string) {
    try {
      const resposta = await api.get(`/ambientes/${id}`)
      return resposta.data
    } catch {
      return AMBIENTES_INICIAIS.find((a) => a.id === id) || null
    }
  },

  async reservar(dados: CriarReservaAmbienteDTO): Promise<Reserva> {
    try {
      const resposta = await api.post<Reserva>('/reservas', {
        tipo: 'ambiente',
        ...dados,
      })
      return resposta.data
    } catch {
      // Simulação autônoma de reserva persistida localmente
      const ambiente = AMBIENTES_INICIAIS.find((a) => a.id === dados.ambienteId)
      const novaReserva: Reserva = {
        id: 'res-' + Math.random().toString(36).substring(2, 9),
        usuarioId: 'usr-logado',
        tipo: 'ambiente',
        ambienteId: dados.ambienteId,
        ambiente: ambiente || undefined,
        dataInicio: `${dados.data}T${dados.horarioInicio}:00`,
        dataFim: `${dados.data}T${dados.horarioFim}:00`,
        status: 'confirmada',
        observacoes: dados.finalidade,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }

      // Salva no localStorage para sincronizar com Minhas Reservas
      try {
        const reservasArmazenadas = JSON.parse(
          localStorage.getItem('@mutua:reservas_criadas') || '[]'
        )
        reservasArmazenadas.unshift(novaReserva)
        localStorage.setItem('@mutua:reservas_criadas', JSON.stringify(reservasArmazenadas))
      } catch {
        // Ignora erro de storage se indisponível
      }

      return novaReserva
    }
  },
}
