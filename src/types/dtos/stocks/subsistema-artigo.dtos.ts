export interface SubsistemaArtigoTableDTO {
    id: string
    artigoId: string
    organismoId: string
    codigoCartaoInstituicao: string
    artigoNumero?: string | null
    artigoDescricao?: string | null
    organismoNome?: string | null
    valorServico: number
    margemOrganismoPercent : number
    valorOrganismo : number
    valorUtente: number
    inativo: boolean
    createdOn: string
}

export interface SubsistemaArtigoDTO extends SubsistemaArtigoTableDTO {
    codigoComplementarAdse?: string | null
    artigoCodigo?: number | null
    lastModifiedOn: string | null
}

export interface SubsistemaArtigoCreateBody {
    artigoId: string
    organismoId: string
    codigoCartaoInstituicao: string 
    valorServico: number
    margemOrganismoPercent: number
    valorOrganismo: number
    valorUtente: number
    inativo: boolean
    codigoComplementarAdse?: string | null
}

export interface SubsistemaArtigoUpdateBody {
    codigoCartaoInstituicao: string
    valorServico: number
    margemOrganismoPercent: number
    valorOrganismo: number
    valorUtente: number
    inativo: boolean
    codigoComplementarAdse?: string | null
}

export type SubsistemaArtigoPaginatedRequest ={
    pageNumber: number
    pageSize: number
    filters?: Array<{id: string, value: string}>
    sorting?: Array<{id: string, desc: boolean}>
    filtroBox?: string
    artigoId?: string
    organismoId?: string
    inativo?: boolean
}