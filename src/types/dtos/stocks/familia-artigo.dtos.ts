export interface FamiliaArtigoLightDTO {
    id: string
    codigo: number
    descricao: string
    path: string
    autocompleteLabel?: string
}

export interface FamiliaArtigoTableDTO {
    id: string
    codigo: number
    nivel: number
    descricao: string
    temFilhos: boolean
    createdOn: string
}

export interface FamiliaArtigoDTO extends FamiliaArtigoTableDTO {
    parentId?: string | null
    urlFoto?: string | null
    path: string
    lastModifiedOn: string | null
}

export interface FamiliaArtigoBreadcrumbDTO {
    id: string 
    descricao: string
    nivel: number
}

export interface FamiliaArtigoSaveBody{
    descricao: string
    parentId?: string | null
    urlFoto?: string | null
}

export type FamiliaArtigoPaginatedRequest = {
    pageNumber: number
    pageSize: number
    filters?: Record<string, string> | Array<{id: string; value : string }>
    sorting?: Array<{id: string; desc: boolean}>
    parentId?: string | null
}