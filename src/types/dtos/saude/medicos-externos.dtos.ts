import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export interface MedicoExternoLightDTO {
  id: string
  nome: string
  numeroContribuinte?: string | null
}

export interface MedicoExternoTableDTO {
  id: string
  nome?: string | null
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  carteira?: string | null
  createdOn: string
}

export interface MedicoExternoDTO {
  id: string
  nome: string
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  carteira?: string | null
  createdOn: string
}

export interface CreateMedicoExternoRequest {
  nome: string
  tipoEntidadeId: number
  numeroContribuinte?: string | null
  carteira?: string | null
}

export interface UpdateMedicoExternoRequest extends CreateMedicoExternoRequest {}

export interface MedicoExternoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}
