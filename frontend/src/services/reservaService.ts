import api from './api'
import type { Reserva, StatusReserva } from '../types'
import { AMBIENTES_INICIAIS } from './ambienteService'
import { EQUIPAMENTOS_INICIAIS } from './equipamentoService'

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
  detalhesTecnicos?: string[]
}

// Reservas pré-existentes representativas para demonstração
const RESERVAS_MOCK_INICIAIS: ItemReservaCompleto[] = [
  {
    id: 'res-sala-exec-1',
    tipo: 'ambiente',
    protocolo: 'MUT-2026-0849',
    titulo: 'Sala de Reuniões Executiva A',
    subtitulo: 'Ambiente Acústico com Videoconferência e TV 65" 4K',
    localOuPatrimonio: 'Sede CREA-PI / Mútua-PI • 2º Andar • Sala 204',
    dataInicio: '2026-10-21T14:00:00',
    dataFim: '2026-10-21T17:00:00',
    status: 'confirmada',
    finalidade: 'Alinhamento técnico e apresentação do laudo estrutural com cliente.',
    criadoEm: '2026-10-18T10:15:00',
    permitirCancelamento: true,
    permitirCheckin: true,
    detalhesTecnicos: [
      'Capacidade para até 8 pessoas',
      'Smart TV 65" 4K com cabo HDMI e AirPlay',
      'Quadro branco magnético e ar-condicionado silencioso',
    ],
  },
  {
    id: 'res-drone-phantom-2',
    tipo: 'equipamento',
    protocolo: 'HUB-2026-0112',
    titulo: 'Drone DJI Phantom 4 RTK',
    subtitulo: 'Crea Tec HUB • Mapeamento Aéreo com Precisão Centimétrica',
    localOuPatrimonio: 'Patrimônio: HUB-0042 • Balcão Sede Teresina',
    dataInicio: '2026-10-24T08:30:00',
    dataFim: '2026-10-26T17:00:00',
    status: 'pendente',
    finalidade: 'Levantamento planialtimétrico cadastral para projeto de regularização fundiária.',
    criadoEm: '2026-10-19T14:20:00',
    permitirCancelamento: true,
    permitirCheckin: false,
    detalhesTecnicos: [
      'Acompanha maleta estanque, controle com tela e 3 baterias',
      'Exige cadastro de operador ativo no SISANT/ANAC',
      'Termo de responsabilidade a ser assinado no balcão',
    ],
  },
  {
    id: 'res-coworking-3',
    tipo: 'ambiente',
    protocolo: 'MUT-2026-0410',
    titulo: 'Espaço Coworking Compartilhado',
    subtitulo: 'Estação de Trabalho Individual com Wi-Fi 6 e Café',
    localOuPatrimonio: 'Térreo • Ala Sul • Sede Mútua-PI',
    dataInicio: '2026-10-14T08:00:00',
    dataFim: '2026-10-14T12:00:00',
    status: 'concluida',
    finalidade: 'Desenvolvimento de projetos complementares hidrossanitários.',
    criadoEm: '2026-10-12T09:00:00',
    permitirCancelamento: false,
    permitirCheckin: false,
    detalhesTecnicos: [
      'Uso de 4 horas computadas da franquia mensal do associado',
      'Check-in realizado presencialmente na recepção',
    ],
  },
  {
    id: 'res-termografica-4',
    tipo: 'equipamento',
    protocolo: 'HUB-2026-0088',
    titulo: 'Câmera Termográfica FLIR E8-XT',
    subtitulo: 'Crea Tec HUB • Diagnóstico Infravermelho Predial e Elétrico',
    localOuPatrimonio: 'Patrimônio: HUB-0019 • Balcão Sede Teresina',
    dataInicio: '2026-10-05T09:00:00',
    dataFim: '2026-10-07T17:00:00',
    status: 'concluida',
    finalidade: 'Inspeção termográfica preventiva em quadros elétricos de indústria cerâmica.',
    criadoEm: '2026-10-02T16:40:00',
    permitirCancelamento: false,
    permitirCheckin: false,
    detalhesTecnicos: [
      'Devolução realizada sem avarias e bateria carregada',
      'Termo de devolução protocolado sob nº TD-2026-098',
    ],
  },
]

export const reservaService = {
  async listar(): Promise<ItemReservaCompleto[]> {
    try {
      const resposta = await api.get<ItemReservaCompleto[]>('/reservas')
      return resposta.data
    } catch {
      // Mescla com reservas que o usuário criou nas outras telas durante a sessão
      let reservasCriadas: ItemReservaCompleto[] = []
      try {
        const armazenadas = localStorage.getItem('@mutua:reservas_criadas')
        if (armazenadas) {
          const listaParsed: Reserva[] = JSON.parse(armazenadas)
          reservasCriadas = listaParsed.map((r) => {
            const ehAmbiente = r.tipo === 'ambiente'
            const ambiente = ehAmbiente
              ? AMBIENTES_INICIAIS.find((a) => a.id === r.ambienteId)
              : null
            const equipamento = !ehAmbiente
              ? EQUIPAMENTOS_INICIAIS.find((e) => e.id === r.equipamentoId)
              : null

            return {
              id: r.id,
              tipo: r.tipo,
              protocolo:
                (ehAmbiente ? 'MUT-2026-' : 'HUB-2026-') +
                Math.floor(1000 + Math.random() * 9000),
              titulo:
                ambiente?.nome ||
                equipamento?.nome ||
                (ehAmbiente ? 'Reserva de Espaço' : 'Empréstimo de Equipamento'),
              subtitulo:
                ambiente?.descricao ||
                equipamento?.descricao ||
                'Reserva realizada através do painel digital',
              localOuPatrimonio:
                ambiente?.localizacao ||
                (equipamento ? `Patrimônio: ${equipamento.patrimonio}` : 'Sede Mútua-PI'),
              dataInicio: r.dataInicio,
              dataFim: r.dataFim,
              status: r.status,
              finalidade: r.observacoes || 'Uso profissional de engenharia/agronomia',
              criadoEm: r.criadoEm || new Date().toISOString(),
              permitirCancelamento: r.status === 'confirmada' || r.status === 'pendente',
              permitirCheckin: r.status === 'confirmada',
              detalhesTecnicos: ambiente?.recursos || equipamento?.especificacoes || [],
            }
          })
        }
      } catch {
        // Ignora erro de parsing
      }

      return [...reservasCriadas, ...RESERVAS_MOCK_INICIAIS]
    }
  },

  async cancelar(id: string): Promise<boolean> {
    try {
      await api.delete(`/reservas/${id}`)
      return true
    } catch {
      // Simulação local de cancelamento
      return true
    }
  },

  async realizarCheckin(id: string): Promise<boolean> {
    try {
      await api.post(`/reservas/${id}/checkin`)
      return true
    } catch {
      return true
    }
  },
}
