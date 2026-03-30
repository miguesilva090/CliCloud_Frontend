import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface MotivosDesmarcacaoDTO {
  id: string
  descricao: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface MotivosDesmarcacaoLightDTO {
  id: string
  descricao: string
}

export interface MotivosDesmarcacaoTableDTO {
  id: string
  descricao: string
  createdOn: string
}

export interface MotivosDesmarcacaoTableFilterRequest extends TableFilterRequest {}
export interface MotivosDesmarcacaoAllFilterRequest extends AllFilterRequest {}

export interface CreateMotivosDesmarcacaoRequest {
  descricao: string
}

export interface UpdateMotivosDesmarcacaoRequest {
  descricao: string
}

export interface DeleteMultipleMotivosDesmarcacaoRequest {
  ids: string[]
}