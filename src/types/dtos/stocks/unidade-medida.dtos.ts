export interface UnidadeMedidaLightDTO {
    id: string
    codigo: number
    descricao: string
    autocompleteLabel?: string
}

export interface UnidadeMedidaTableDTO {
    id: string
    codigo: number
    descricao: string
    createdOn: string
}

export interface UnidadeMedidaDTO extends UnidadeMedidaTableDTO {
    lastModifiedOn: string | null
}

export interface UnidadeMedidaSaveBody {
    descricao: string
}

export type UnidadeMedidaPaginatedRequest = {
    pageNumber: number
    pageSize: number
    filters?: Record<string, string> | Array<{ id: string; value: string }>
    sorting?: Array<{ id: string; desc: boolean }>
}
