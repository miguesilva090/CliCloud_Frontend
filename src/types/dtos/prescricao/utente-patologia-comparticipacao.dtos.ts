export interface UtentePatologiaComparticipacaoDTO {
    id: string
    utenteId: string
    codigoComparticipacao: number
    designacao?: string | null
    createdOn?: string
}

export interface CreateUtentePatologiaComparticipacaoRequest {
    utenteId: string
    codigoComparticipacao: number
    designacao?: string | null
}