export interface GoniometriasLightDTO {
    id: string 
    descricao: string 
}

export interface GoniometriasTableDTO{
    id: string 
    descricao: string
    createdOn: string
}

export interface GoniometriasDTO{
    id:string 
    descricao: string 
    createdOn: string 
    lastModifiedOn?: string
}

export interface CreateGoniometriasRequest{
    descricao:string
}

export interface UpdateGoniometriasRequest{
    descricao:string
}

