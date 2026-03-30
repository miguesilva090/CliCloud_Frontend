import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface TemperaturaCorporalTableFilterRequest extends TableFilterRequest {}

export interface TemperaturaCorporalTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  temperatura: number
  createdOn: string
}

export interface TemperaturaCorporalDTO extends TemperaturaCorporalTableDTO {
  observacoes?: string | null
}

export interface TemperaturaCorporalRequest
  extends Omit<TemperaturaCorporalDTO, 'id' | 'createdOn'> {}

export interface CreateTemperaturaCorporalRequest
  extends TemperaturaCorporalRequest {}

export interface UpdateTemperaturaCorporalRequest
  extends Omit<TemperaturaCorporalRequest, 'utenteId'> {}

export interface TemperaturaCorporalLightDTO
  extends Omit<TemperaturaCorporalTableDTO, 'createdOn'> {}

