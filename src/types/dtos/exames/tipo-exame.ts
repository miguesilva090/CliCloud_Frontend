import type {GrupoAnaliseLinhaDTO, CreateGrupoAnaliseLinhaRequest, UpdateGrupoAnaliseLinhaRequest} from './grupo-analise-linha'

export interface TipoExameDTO {
    id: string 
    designacao: string
    categoriaProcedimentoId?: string | null
    taxaIvaId?: string | null
    ean?: string | null
    preco: number 
    motivoIsencaoId?: string | null 
    recomendacoesVariaveis?: string | null
    laboratorio?: number | null 
    inativo: boolean 
    createdOn: string 
    lastModifiedOn?: string | null
    grupoAnaliseLinhas?: GrupoAnaliseLinhaDTO[] | null
}

export interface TipoExameLightDTO {
    id: string 
    designacao: string
}

export interface TipoExameTableDTO {
    id: string
    designacao: string
    preco: number 
    ean?: string | null
    inativo: boolean 
    createdOn: string
}

export interface CreateTipoExameRequest {
    designacao: string
    categoriaProcedimentoId?: string | null
    taxaIvaId?: string | null
    ean?: string | null
    preco: number
    motivoIsencaoId?: string | null
    recomendacoesVariaveis?: string | null
    laboratorio?: number | null
    inativo: boolean 
    grupoAnaliseLinhas: CreateGrupoAnaliseLinhaRequest[]
}

export interface UpdateTipoExameRequest {
    designacao: string
    categoriaProcedimentoId?: string | null
    taxaIvaId?: string | null
    ean?: string | null
    preco: number 
    motivoIsencaoId?: string | null
    recomendacoesVariaveis?: string | null
    laboratorio?: number | null
    inativo: boolean 
    grupoAnaliseLinhas: UpdateGrupoAnaliseLinhaRequest[]
}