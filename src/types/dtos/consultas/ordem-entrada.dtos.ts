import type { PaginationFilterRequest, TableFilter, TanstackSorting } from '@/types/dtos/common/table-filters.dtos'

export type OrdemEntradaTableDTO = {
  id: string
  consultaMarcacaoId?: string | null
  data?: string | null
  horaInicio?: string | null
  horaChegada?: string | null
  ordem?: number | null
  utenteId: string
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoNome?: string | null
  especialidadeDesignacao?: string | null
  tipoConsultaDesignacao?: string | null
  confirmado?: boolean | null
  statusConsulta?: number | null
  statusConsultaLabel?: string | null
  dataHoraMarcacao?: string | null
  consultaPromovida: boolean
  consultaId?: string | null
  createdBy: string
  createdByNome?: string | null
}

export type OrdemEntradaPaginatedRequest = PaginationFilterRequest & {
  filters?: TableFilter[]
  sorting?: TanstackSorting
  dataDe?: string
  dataAte?: string
  utenteId?: string
  medicoId?: string
  especialidadeId?: string
  incluirHistorico?: boolean
}

export type DefinirOrdemEntradaRequest = {
  ordem: number
}

export type AnularOrdemEntradaRequest = {
  motivo: string
}

export type OrdemEntradaRegistoDTO = {
  id: string
  utenteId: string
  utenteNome?: string | null
  utenteNumero?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  medicoId?: string | null
  medicoNome?: string | null
  especialidadeId?: string | null
  especialidadeDesignacao?: string | null
  salaId?: string | null
  salaNome?: string | null
  tipoAdmissaoId?: string | null
  tipoConsultaId?: string | null
  data?: string | null
  horaInicio?: string | null
  horaFim?: string | null
  obs?: string | null
  createdByNome?: string | null
  dataHoraMarcacao?: string | null
}

export type SaveOrdemEntradaRegistoRequest = {
  utenteId: string
  organismoId: string
  medicoId: string
  tipoAdmissaoId: string
  tipoConsultaId: string
  salaId?: string | null
  data: string
  horaInicio: string
  duracao?: string | null
  observacoes?: string | null
}

export type OrdemEntradaHorasDisponiveisRequest = {
  medicoId: string
  tipoConsultaId: string
  data: string
  admissaoId?: string | null
}

export type OrdemEntradaHorasDisponiveisDTO = {
  horarioFlexivel: boolean
  intervalo?: string | null
  horasPossiveis: string[]
}
