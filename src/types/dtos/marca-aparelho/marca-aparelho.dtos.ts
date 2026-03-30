import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface MarcaAparelhoDTO {
  id: string
  designacao: string | null
  createdOn: string
  lastModifiedOn?: string | null
}

export interface MarcaAparelhoLightDTO {
  id: string
  designacao: string | null
}

export interface MarcaAparelhoTableDTO {
  id: string
  designacao: string | null
  createdOn: string
  lastModifiedOn?: string | null
}

export interface MarcaAparelhoTableFilterRequest extends TableFilterRequest {}
export interface MarcaAparelhoAllFilterRequest extends AllFilterRequest {}

export interface CreateMarcaAparelhoRequest {
  designacao: string
}

export interface UpdateMarcaAparelhoRequest {
  designacao: string
}

export interface DeleteMultipleMarcaAparelhoRequest {
  ids: string[]
}
