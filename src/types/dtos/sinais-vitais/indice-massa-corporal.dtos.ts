import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface IndiceMassaCorporalTableFilterRequest extends TableFilterRequest {}

export interface IndiceMassaCorporalTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  peso: number
  altura: number
  createdOn: string
}

export interface IndiceMassaCorporalDTO extends IndiceMassaCorporalTableDTO {
  observacoes?: string | null
}

export interface IndiceMassaCorporalRequest
  extends Omit<IndiceMassaCorporalDTO, 'id' | 'createdOn'> {}

export interface CreateIndiceMassaCorporalRequest
  extends IndiceMassaCorporalRequest {}

export interface UpdateIndiceMassaCorporalRequest
  extends Omit<IndiceMassaCorporalRequest, 'utenteId'> {}

export interface IndiceMassaCorporalLightDTO
  extends Omit<IndiceMassaCorporalTableDTO, 'createdOn'> {}

