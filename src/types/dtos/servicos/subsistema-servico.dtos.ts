import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'

export interface SubsistemaServicoDTO {
  id: string
  servicoId: string
  subsistemaId: string
  organismoId: string
  valorServico: number
  valorOrganismo: number
  margemOrganismoPercent: number
  valorUtente: number
  margemUtentePercent: number
  inativo: boolean
  createdOn?: string
  lastModifiedOn?: string
}

export interface SubsistemaServicoTableDTO {
  id: string
  servicoId: string
  subsistemaId: string
  organismoId: string
  valorServico: number
  valorOrganismo: number
  valorUtente: number
  inativo: boolean
}

export interface SubsistemaServicoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

export interface CreateSubsistemaServicoRequest {
  servicoId: string
  subsistemaId: string
  organismoId: string
  valorServico: number
  valorOrganismo: number
  margemOrganismoPercent: number
  valorUtente: number
  margemUtentePercent: number
  inativo: boolean
}

export interface UpdateSubsistemaServicoRequest extends CreateSubsistemaServicoRequest {
  id: string
}

