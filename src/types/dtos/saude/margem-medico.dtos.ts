import type {
  PaginationFilterRequest,
  TableFilter,
  AllFilterRequest,
} from '@/types/dtos/common/table-filters.dtos'

export interface MargemMedicoDTO {
  id: string
  servicoId: string
    servicoDesignacao?: string
    medicoId: string
    medico?: {id: string, nome: string}
    valorMargem?: number
    percentagemMargem?: number 
    createdOn: string
    lastModifiedOn?: string 
}

export interface MargemMedicoLightDTO {
  id: string
  servicoId: string
  servicoDesignacao?: string
  medicoId: string
  medicoNome?: string
  valorMargem?: number
  percentagemMargem?: number
}

export interface MargemMedicoTableDTO {
  id: string
  servicoId: string 
    servicoDesignacao?: string 
    medicoId: string
    medicoNome?: string 
    medicoNumeroContribuinte?: string
    valorMargem?: number
    percentagemMargem?: number
    createdOn?: string
}

export interface MargemMedicoTableFilterRequest extends PaginationFilterRequest {
  filters?: TableFilter[]
}

export interface MargemMedicoAllFilterRequest extends AllFilterRequest {}

export interface CreateMargemMedicoRequest {
  servicoId: string 
    medicoId: string 
    valorMargem?: number 
    percentagemMargem?: number
}

export interface UpdateMargemMedicoRequest extends CreateMargemMedicoRequest {}

export interface DeleteMultipleMargemMedicoRequest 
{
    ids: string[]
}