import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AntecedentesCirurgicosTableFilterRequest extends TableFilterRequest {}

export interface AntecedentesCirurgicosTableDTO {
  id: string
  utenteId: string
  ano?: number | null
  tipoCirurgia?: string | null
  houveComplicacoes?: boolean | null
  complicacoes?: string | null
  observacoes?: string | null
}

export interface AntecedentesCirurgicosDTO extends AntecedentesCirurgicosTableDTO {
  createdOn: string
  createdBy?: string | null
}

export interface CreateAntecedentesCirurgicosRequest {
  utenteId: string
  ano?: number | null
  tipoCirurgia?: string | null
  houveComplicacoes?: boolean | null
  complicacoes?: string | null
  observacoes?: string | null
}

export interface UpdateAntecedentesCirurgicosRequest {
  utenteId: string
  ano?: number | null
  tipoCirurgia?: string | null
  houveComplicacoes?: boolean | null
  complicacoes?: string | null
  observacoes?: string | null
}

