// ============================================================
// Tipos principais do sistema Mútua-PI
// ============================================================

// --- Usuário ---
export type PerfilUsuario = 'profissional' | 'admin' | 'colaborador'

export interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string
  registroCrea?: string
  perfil: PerfilUsuario
  ativo: boolean
  criadoEm: string
}

// --- Ambiente ---
export type TipoAmbiente =
  | 'coworking'
  | 'sala_estudo'
  | 'sala_multiuso'
  | 'sala_reuniao'
  | 'auditorio'

export interface Ambiente {
  id: string
  nome: string
  tipo: TipoAmbiente
  capacidade: number
  descricao?: string
  regras?: string
  imagens?: string[]
  ativo: boolean
}

// --- Equipamento (Crea Tec HUB) ---
export type StatusEquipamento = 'disponivel' | 'em_uso' | 'manutencao' | 'indisponivel'

export interface Equipamento {
  id: string
  nome: string
  descricao?: string
  patrimonio: string
  categoria: string
  status: StatusEquipamento
  imagens?: string[]
  ativo: boolean
}

// --- Reserva ---
export type StatusReserva =
  | 'pendente'
  | 'confirmada'
  | 'cancelada'
  | 'concluida'
  | 'em_andamento'

export type TipoReserva = 'ambiente' | 'equipamento'

export interface Reserva {
  id: string
  usuarioId: string
  usuario?: Usuario
  tipo: TipoReserva
  ambienteId?: string
  ambiente?: Ambiente
  equipamentoId?: string
  equipamento?: Equipamento
  dataInicio: string
  dataFim: string
  status: StatusReserva
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

// --- Retirada/Devolução de Equipamento ---
export type CondicaoEquipamento = 'otimo' | 'bom' | 'regular' | 'danificado'

export interface MovimentacaoEquipamento {
  id: string
  reservaId: string
  reserva?: Reserva
  retiradoEm?: string
  devolvidoEm?: string
  condicaoRetirada?: CondicaoEquipamento
  condicaoDevolucao?: CondicaoEquipamento
  observacaoRetirada?: string
  observacaoDevolucao?: string
}

// --- API Responses ---
export interface ApiResponse<T> {
  data: T
  mensagem?: string
  sucesso: boolean
}

export interface PaginacaoResponse<T> {
  dados: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

// --- Filtros ---
export interface FiltroDisponibilidade {
  dataInicio: string
  dataFim: string
  tipo?: TipoReserva
}
