export interface GrupoAnaliseLinhaDTO {
    id: string
    analiseId: string
    analiseNome?: string | null
    ordem: number
    descricao?: string | null
    unidadeMedida?: string | null
    valoresReferencia?: string | null
}

export interface CreateGrupoAnaliseLinhaRequest {
    analiseId: string
    ordem: number
    descricao?: string | null
    unidadeMedida?: string | null 
    valoresReferencia?: string | null
}

export interface UpdateGrupoAnaliseLinhaRequest {
    id?: string | null
    analiseId: string
    ordem: number
    descricao?: string | null
    unidadeMedida?: string | null
    valoresReferencia?: string | null
}
