import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export enum ModoListagemAdmissaoTratamento {
  UtentesHora = 0,
  Presentes = 1,
  LocalTratamento = 2,
}

export interface AdmissaoTratamentoTableDTO {
  id: string
  tratamentoId: string
  numSessao?: number | null
  data?: string | null
  horaInic?: string | null
  horaFisio?: string | null
  utenteId?: string | null
  utenteNome?: string | null
  numeroUtente?: string | null
  fisioterapeutaId?: string | null
  fisioterapeutaNome?: string | null
  auxiliarId?: string | null
  auxiliarNome?: string | null
  outroTecnicoId?: string | null
  outroTecnicoNome?: string | null
  localTratamentoId?: string | null
  localTratamentoNome?: string | null
  confirmado?: number | null
  efetuado?: number | null
  faltou?: number | null
  desmarcado?: number | null
  numSessaoTratamento?: number | null
  nFalta?: number | null
  designacao?: string | null
}

export interface AdmissaoTratamentoTableFilterRequest
  extends PaginationFilterRequest {
  modo: ModoListagemAdmissaoTratamento
  dataReferencia?: string | null
  localTratamentoId?: string | null
  fisioterapeutaId?: string | null
  utenteId?: string | null
  /** Espelha Filters do BE (PaginationFilter + TableFilter). */
  filters?: TableFilter[]
}

export interface UpdateAdmissaoTratamentoSituacaoRequest {
  campo: 'confirmado' | 'efetuado' | 'faltou'
  valor: 0 | 1
}
