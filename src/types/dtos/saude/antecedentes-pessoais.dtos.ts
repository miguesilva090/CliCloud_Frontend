import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AntecedentesPessoaisTableFilterRequest extends TableFilterRequest {}

export interface AntecedentesPessoaisTableDTO {
  id: string
  utenteId: string
  doencaId?: string | null
  nomeDoenca?: string | null
  ano?: number | null
  idade?: number | null
  data?: string | null
}

export interface AntecedentesPessoaisDTO extends AntecedentesPessoaisTableDTO {
  createdOn: string
  createdBy?: string | null
}

export interface CreateAntecedentesPessoaisRequest {
  utenteId: string
  doencaId?: string | null
  nomeDoenca?: string | null
  ano?: number | null
  idade?: number | null
  data?: string | null
}

export interface UpdateAntecedentesPessoaisRequest extends CreateAntecedentesPessoaisRequest {}

