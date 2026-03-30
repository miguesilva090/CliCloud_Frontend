import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface ModeloAparelhoDTO {
  id: string
  designacao: string | null
  marcaAparelhoId: string
  marcaAparelhoDesignacao: string | null
  createdOn: string
  lastModifiedOn?: string | null
}

export interface ModeloAparelhoLightDTO {
  id: string
  designacao: string | null
  marcaAparelhoId: string
  marcaAparelhoDesignacao: string | null
}

export interface ModeloAparelhoTableDTO {
  id: string
  designacao: string | null
  marcaAparelhoId: string
  marcaAparelhoDesignacao: string | null
  createdOn: string
  lastModifiedOn?: string | null
}

export interface ModeloAparelhoTableFilterRequest extends TableFilterRequest {}
export interface ModeloAparelhoAllFilterRequest extends AllFilterRequest {}

export interface CreateModeloAparelhoRequest {
  designacao: string
  marcaAparelhoId: string
}

export interface UpdateModeloAparelhoRequest {
  designacao: string
  marcaAparelhoId: string
}

export interface DeleteMultipleModeloAparelhoRequest {
  ids: string[]
}
