export interface CategoriaProcedimentoDTO {
    id: string
    descricao: string
    createdOn: string
    lastModifiedOn?: string | null
}

export interface CategoriaProcedimentoLightDTO {
    id: string
    descricao: string
}

export interface CategoriaProcedimentoTableDTO {
    id: string
    descricao: string
    createdOn: string
}

export interface CreateCategoriaProcedimentoRequest {
    descricao: string
}

export interface UpdateCategoriaProcedimentoRequest {
    descricao: string
}