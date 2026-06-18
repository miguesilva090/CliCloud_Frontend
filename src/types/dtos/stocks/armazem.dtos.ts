export interface ArmazemLightDTO {
    id: string
    codigo: number
    nome: string
    armazemGeral: boolean
    autocompleteLabel?: string
}

export interface ArmazemTableDTO {
    id: string
    codigo: number
    nome: string
    localidade?: string | null
    telefone?: string | null
    armazemGeral: boolean
    createdOn: string
}

export interface ArmazemDTO extends ArmazemTableDTO {
    morada?: string | null
    codigoPostalId?: string | null
    codigoPostalCodigo?: string | null
    codigoPostalLocalidade?: string | null
    fax?: string | null 
    lastModifiedOn: string | null
}

export interface ArmazemSaveBody {
    nome: string
    morada?: string | null
    localidade?: string | null
    codigoPostalId?: string | null
    telefone?: string | null
    fax?: string | null
    armazemGeral: boolean
}


export type ArmazemPaginatedRequest = {
    pageNumber: number
    pageSize: number
    filters?: Record<string, string> | Array<{id: string, value: string}>
    sorting?: Array<{id: string, desc: boolean}>
    armazemGeral?: boolean
}

