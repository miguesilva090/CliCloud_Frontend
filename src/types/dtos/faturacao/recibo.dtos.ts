import type { PaginatedRequest } from "@/types/api/responses"

export type ReciboDTO = {
    id: string
    tipoDocumentoId: string
    numeroDocumento: number
    data?: string | null
    utenteId?: string | null
    organismoId?: string | null
    totalDocumento?: number | null
    totalLiquido?: number | null
    estado?: number | null
    liquidado: boolean
    createdOn: string
    lastModifiedOn?: string | null
}

export type ReciboLightDTO = {
    id: string
    numeroDocumento: number
    data?: string | null
    totalLiquido?: number | null
}

export type ReciboTableDTO = {
    id: string
    numeroDocumento: number
    data?: string | null
    utenteId?: string | null
    totalDocumento?: number | null
    totalLiquido?: number | null
    estado?: number | null
    liquidado: boolean
    createdOn: string
}

export type ReciboAllFilter = {
    filters?: Array<{ id: string; value: string }>
    sorting?: Array<{ id: string; desc: boolean }>
}

export type ReciboTableFilter = PaginatedRequest