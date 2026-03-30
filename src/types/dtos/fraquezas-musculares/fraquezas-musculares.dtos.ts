import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

/** DTO completo (detalhe) – alinhado com o backend FraquezasMuscularesDTO */
export interface FraquezasMuscularesDTO {
  id: string
  descricao: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface FraquezasMuscularesLightDTO {
  id: string
  descricao: string
}

export interface FraquezasMuscularesTableDTO {
  id: string
  descricao: string
  createdOn: string
}

export interface FraquezasMuscularesTableFilterRequest extends TableFilterRequest {}
export interface FraquezasMuscularesAllFilterRequest extends AllFilterRequest {}

export interface CreateFraquezasMuscularesRequest {
  descricao: string
}

export interface UpdateFraquezasMuscularesRequest {
  descricao: string
}

export interface DeleteMultipleFraquezasMuscularesRequest {
  ids: string[]
}