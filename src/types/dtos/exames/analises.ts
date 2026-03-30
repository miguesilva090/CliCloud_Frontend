export interface AnaliseDTO {
    id: string
    nome: string
    unidadeMedida?: string | null
    valoresReferencia?: string | null
    createdOn: string
    lastModifiedOn?: string | null
}

export interface AnaliseLightDTO {
    id: string
    nome: string
    unidadeMedida?: string | null
}

export interface AnaliseTableDTO {
    id: string
    nome: string
    unidadeMedida?: string | null
    valoresReferencia?: string | null
    createdOn: string
}

export interface CreateAnaliseRequest {
    nome: string
    unidadeMedida?: string | null
    valoresReferencia?: string | null
}

export interface UpdateAnaliseRequest {
    nome: string
    unidadeMedida?: string | null
    valoresReferencia?: string | null
}