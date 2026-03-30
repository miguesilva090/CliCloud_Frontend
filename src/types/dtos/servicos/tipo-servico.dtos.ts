import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'

export interface TipoServicoDTO {
  id: string
  descricao: string
  taxaModeradoraSns?: number
  partilhaSemRequisicao: boolean
  createdOn?: string
  lastModifiedOn?: string
}

export interface TipoServicoLightDTO {
  id: string
  descricao: string
}

export interface TipoServicoTableDTO {
  id: string
  descricao: string
  taxaModeradoraSns?: number
  partilhaSemRequisicao: boolean
  createdOn?: string
  servicosCount: number
}

export interface TipoServicoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

export interface CreateTipoServicoRequest {
  descricao: string
  taxaModeradoraSns?: number
  partilhaSemRequisicao: boolean
}

export interface UpdateTipoServicoRequest extends CreateTipoServicoRequest {
  id: string
}

export interface DeleteMultipleTipoServicoRequest {
  ids: string[]
}

