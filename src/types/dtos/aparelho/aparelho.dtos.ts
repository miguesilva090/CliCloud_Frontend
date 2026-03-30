import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AparelhoDTO {
  id: string
  tipoAparelhoId: string
  tipoAparelhoDesignacao: string | null
  modeloAparelhoId?: string | null
  modeloAparelhoDesignacao?: string | null
  marcaAparelhoDesignacao?: string | null
  codigoSerie: string | null
  codigoInventario: string | null
  local: string | null
  observacoes: string | null
  ocupado: boolean
  createdOn: string
}

export interface AparelhoLightDTO {
  id: string
  tipoAparelhoDesignacao: string | null
  codigoSerie: string | null
  ocupado: boolean
}

export interface AparelhoTableDTO {
  id: string
  tipoAparelhoId: string
  tipoAparelhoDesignacao: string | null
  modeloAparelhoId?: string | null
  modeloAparelhoDesignacao?: string | null
  marcaAparelhoDesignacao?: string | null
  codigoSerie: string | null
  codigoInventario: string | null
  local: string | null
  ocupado: boolean
  createdOn: string
}

export interface AparelhoTableFilterRequest extends TableFilterRequest {}
export interface AparelhoAllFilterRequest extends AllFilterRequest {}

export interface CreateAparelhoRequest {
  tipoAparelhoId: string
  modeloAparelhoId?: string | null
  codigoSerie?: string | null
  codigoInventario?: string | null
  local?: string | null
  observacoes?: string | null
  ocupado: boolean
}

export interface UpdateAparelhoRequest {
  tipoAparelhoId: string
  modeloAparelhoId?: string | null
  codigoSerie?: string | null
  codigoInventario?: string | null
  local?: string | null
  observacoes?: string | null
  ocupado: boolean
}

export interface DeleteMultipleAparelhoRequest {
  ids: string[]
}
