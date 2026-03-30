import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface TipoAparelhoDTO {
  id: string
  designacao: string | null
  createdOn: string
}

export interface TipoAparelhoLightDTO {
  id: string
  designacao: string | null
}

export interface TipoAparelhoTableDTO {
  id: string
  designacao: string | null
  createdOn: string
}

export interface TipoAparelhoTableFilterRequest extends TableFilterRequest {}
export interface TipoAparelhoAllFilterRequest extends AllFilterRequest {}

export interface CreateTipoAparelhoRequest {
  designacao: string
}

export interface UpdateTipoAparelhoRequest {
  designacao: string
}

export interface DeleteMultipleTipoAparelhoRequest {
  ids: string[]
}
