export interface ModoPagamentoLightDTO {
    id: string 
    codigo: number 
    descricao: string
    abreviatura: string
    temNumAssociado: boolean
    temContaBancaria: boolean
    contaBancariaId?: string | null
    contaBancariaNumero?: string | null
    autocompleteLabel?: string
}

export interface ModoPagamentoTableDTO {
    id: string 
    codigo: number
    descricao: string
    abreviatura: string
    temNumAssociado: boolean
    temContaBancaria: boolean
    historico: boolean
    createdOn: string
}

export interface ModoPagamentoDTO extends ModoPagamentoTableDTO {
    tipoPagamentoDescricao: string
    contaBancariaId?: string | null
    contaBancariaNumero?: string | null
    lastModifiedOn?: string | null
}

export interface ModoPagamentoSaveBody {
    descricao: string
    abreviatura: string
    temNumAssociado: boolean
    temContaBancaria: boolean
    contaBancariaId?: string | null
}

export type ModoPagamentoPaginatedRequest = {
    pageNumber: number
    pageSize: number 
    filters?: Record<string, string> | Array<{ id: string; value: string }>
    sorting?: Array<{ id: string; desc: boolean }>
    filtrarHistorico?: boolean
}