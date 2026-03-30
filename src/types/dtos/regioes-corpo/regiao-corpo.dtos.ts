export interface RegiaoCorpoLightDTO {
    id: string
    descricao: string
}

export interface RegiaoCorpoTableDTO{
    id:string
    descricao:string
    createdOn: string 
}

export interface RegiaoCorpoDTO{
    id:string
    descricao:string
    createdOn: string
    lastModifiedOn?: string
}

export interface CreateRegiaoCorpoRequest{
    descricao:string
}

export interface UpdateRegiaoCorpoRequest{
    descricao:string
}