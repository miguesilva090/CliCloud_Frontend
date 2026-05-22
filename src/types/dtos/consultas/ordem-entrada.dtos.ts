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
