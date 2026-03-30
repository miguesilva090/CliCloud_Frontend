import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface TensaoArterialTableFilterRequest extends TableFilterRequest {}

export interface TensaoArterialTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  tensaoSistolica: number
  tensaoDiastolica: number
  createdOn: string
}

export interface TensaoArterialDTO extends TensaoArterialTableDTO {
  observacoes?: string | null
}

export interface TensaoArterialRequest
  extends Omit<TensaoArterialDTO, 'id' | 'createdOn'> {}

export interface CreateTensaoArterialRequest extends TensaoArterialRequest {}

export interface UpdateTensaoArterialRequest
  extends Omit<TensaoArterialRequest, 'utenteId'> {}

export interface TensaoArterialLightDTO
  extends Omit<TensaoArterialTableDTO, 'createdOn'> {}

