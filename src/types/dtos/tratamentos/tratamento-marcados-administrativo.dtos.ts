import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export enum ModoListagemTratamentoMarcados {
  Marcados = 0,
  PorLocal = 1,
  PorUtente = 2,
}

export interface TratamentoMarcadosTableDTO {
  id: string
  designacao?: string | null
  nomePatologia?: string | null
  utenteId?: string | null
  utenteNome?: string | null
  numeroUtente?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  lotes: number
  dataFim?: string | null
  dataInic?: string | null
  iniciado: number
  suspenso: number
  terminado: number
  provisorio: number
  debito?: number | null
  localTratamentoId?: string | null
  localTratamentoNome?: string | null
}

export interface TratamentoMarcadosTableFilterRequest
  extends PaginationFilterRequest {
  modo: ModoListagemTratamentoMarcados
  localTratamentoId?: string | null
  utenteId?: string | null
  /** Espelha Filters do BE (PaginationFilter + TableFilter). */
  filters?: TableFilter[]
}
