import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AntecedentesFamiliaresUtenteTableFilterRequest extends TableFilterRequest {}

export interface AntecedentesFamiliaresUtenteTableDTO {
  id: string
  utenteId: string
  doencaId?: string | null
  nomeDoenca?: string | null
  ano?: number | null
  idade?: number | null
  data?: string | null
  grauParentescoId: string
  grauParentesco?: string | null
}

export interface AntecedentesFamiliaresUtenteDTO extends AntecedentesFamiliaresUtenteTableDTO {
  createdOn: string
  createdBy?: string | null
}

export interface CreateAntecedentesFamiliaresUtenteRequest {
  utenteId: string
  doencaId?: string | null
  ano?: number | null
  idade?: number | null
  data?: string | null
  grauParentescoId: string
}

export interface UpdateAntecedentesFamiliaresUtenteRequest
  extends CreateAntecedentesFamiliaresUtenteRequest {}

