import type { PaginationFilterRequest, TableFilter } from '@/types/dtos/common/table-filters.dtos'

export interface ServicoDTO {
  id: string
  designacao: string
  tipoServicoId: string
  tipoServicoDescricao?: string
  preco?: number
  duracao?: string
  taxaIvaId?: string
  ean?: string
  tipoAparelhoId?: string
  tipoAparelhoDesignacao?: string
  tratDentario: boolean
  codigoMotivoIsencao?: number
  inativo: boolean
  createdOn?: string
  lastModifiedOn?: string
}

export interface ServicoLightDTO {
  id: string
  designacao: string
  tipoServicoId: string
}

export interface ServicoTableDTO {
  id: string
  designacao: string
  tipoServicoId: string
  tipoServicoDescricao?: string
  preco?: number
   tratDentario: boolean
  inativo: boolean
  createdOn?: string
}

export interface ServicoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

export interface CreateServicoRequest {
  designacao: string
  tipoServicoId: string
  preco?: number
  duracao?: string
  taxaIvaId?: string
  ean?: string
  tipoAparelhoId?: string
  tratDentario: boolean
  codigoMotivoIsencao?: number
  inativo: boolean
}

export interface UpdateServicoRequest extends CreateServicoRequest {
  id: string
}

export interface DeleteMultipleServicoRequest {
  ids: string[]
}

