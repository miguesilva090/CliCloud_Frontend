import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface MotivoAltaDTO {
  id: string
  descricao: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface MotivoAltaLightDTO {
  id: string
  descricao: string
}

export interface MotivoAltaTableDTO {
  id: string
  descricao: string
  createdOn: string
}

export interface MotivoAltaTableFilterRequest extends TableFilterRequest {}
export interface MotivoAltaAllFilterRequest extends AllFilterRequest {}

export interface CreateMotivoAltaRequest {
  descricao: string
}

export interface UpdateMotivoAltaRequest {
  descricao: string
}

export interface DeleteMultipleMotivoAltaRequest {
  ids: string[]
}
