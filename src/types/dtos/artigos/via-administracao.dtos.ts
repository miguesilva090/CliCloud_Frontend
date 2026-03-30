import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'

export interface ViaAdministracaoDTO {
  id: string
  descricao: string
  createdOn?: string
}

export interface ViaAdministracaoTableDTO {
  id: string
  descricao: string
}

export interface ViaAdministracaoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

export interface CreateViaAdministracaoRequest {
  descricao: string
}

export interface UpdateViaAdministracaoRequest {
  id: string
  descricao: string
}

export interface DeleteMultipleViaAdministracaoRequest {
  ids: string[]
}
