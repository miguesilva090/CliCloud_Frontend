export interface CondicaoPagamentoLightDTO {
    id: string
    codigo: number
    descricao: string
    nDiasPagamento?: number | null
    desconto?: number | null
}

export interface CondicaoPagamentoTableDTO extends CondicaoPagamentoLightDTO {
    desconto?: number | null
    createdOn: string
}

export interface CondicaoPagamentoDTO extends CondicaoPagamentoTableDTO {
    lastModifiedOn?: string | null
}

export interface CondicaoPagamentoSaveBody {
    descricao: string
    nDiasPagamento?: number | null
    desconto?: number | null
}