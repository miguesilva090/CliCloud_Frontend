import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface GlicemiaCapilarTableFilterRequest extends TableFilterRequest {}

export interface GlicemiaCapilarTableDTO {
  id: string
  utenteId: string
  data: string
  hora: string
  glicemia: number
  createdOn: string
}

export interface GlicemiaCapilarDTO extends GlicemiaCapilarTableDTO {
  observacoes?: string | null
}

export interface GlicemiaCapilarRequest
  extends Omit<GlicemiaCapilarDTO, 'id' | 'createdOn'> {}

export interface CreateGlicemiaCapilarRequest extends GlicemiaCapilarRequest {}

export interface UpdateGlicemiaCapilarRequest
  extends Omit<GlicemiaCapilarRequest, 'utenteId'> {}

export interface GlicemiaCapilarLightDTO
  extends Omit<GlicemiaCapilarTableDTO, 'createdOn'> {}

