import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'

export interface GrupoViasAdministracaoLinhaItemDTO {
  id?: string
  viaId?: string
  viaDescricao?: string
  descricao?: string
  quantidade?: number
  linha: number
}

export interface GrupoViasAdministracaoDTO {
  id: string
  descricao: string
  createdOn?: string
  vias?: GrupoViasAdministracaoLinhaItemDTO[]
}

export interface GrupoViasAdministracaoTableDTO {
  id: string
  descricao: string
}

export interface GrupoViasAdministracaoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

export interface CreateGrupoViasAdministracaoLinhaRequest {
  viaId?: string
  descricao?: string
  quantidade?: number
}

export interface CreateGrupoViasAdministracaoRequest {
  descricao: string
  linhas?: CreateGrupoViasAdministracaoLinhaRequest[]
}

export interface UpdateGrupoViasAdministracaoLinhaRequest {
  viaId?: string
  descricao?: string
  quantidade?: number
}

export interface UpdateGrupoViasAdministracaoRequest {
  id: string
  descricao: string
  linhas?: UpdateGrupoViasAdministracaoLinhaRequest[]
}

export interface DeleteMultipleGrupoViasAdministracaoRequest {
  ids: string[]
}
