export interface FeriadoDTO 
{
    id: string
    clinicaId: string
    data: string 
    designacao: string
    ativo: boolean
}

export interface CreateFeriadoRequest
{
    data: string
    designacao: string
}

export interface UpdateFeriadoRequest 
{
    data: string
    designacao: string
    ativo: boolean
}

export interface InsertFeriadosAnoRequest
{
    ano: number
}

export interface ImportFeriadosRequest
{
    clinicaOrigemId: string
}

export interface FeriadoTableFilter
{
    pageNumber: number
    pageSize: number
    dataDe?: string
    dataAte?: string
    designacao?: string
    ativo?: boolean
    sorting?: Array<{ id: string; desc: boolean }>
}
