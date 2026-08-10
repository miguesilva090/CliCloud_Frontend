import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export type HistoricoTratamentoModo =
  | 'datas'
  | 'utentes'
  | 'fisioterapeuta'
  | 'auxiliar'
  | 'outro'
  | 'organismo'
  | 'credencial'

export interface HistoricoTratamentoTableDTO {
  id: string
  designacao?: string | null
  utenteId?: string | null
  numeroUtente?: string | null
  utenteNome?: string | null
  dataInic?: string | null
  dataFim?: string | null
  numSessao?: number | null
  pago?: number | null
  faturado?: number | null
  confDfim?: number | null
  credencial?: string | null
  isencao?: number | null
  medicoId?: string | null
  medicoNome?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  fisioterapeutaId?: string | null
  fisioterapeutaNome?: string | null
  auxiliarId?: string | null
  auxiliarNome?: string | null
  outroTecnicoId?: string | null
  outroTecnicoNome?: string | null
}

export interface HistoricoTratamentoTableFilterRequest
  extends PaginationFilterRequest {
  modo: HistoricoTratamentoModo
  utenteId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  filters?: TableFilter[]
}

export interface HistoricoTratamentoObservacoesDTO {
  observacoes: string
}

export interface AppendHistoricoTratamentoObservacaoRequest {
  texto: string
}
