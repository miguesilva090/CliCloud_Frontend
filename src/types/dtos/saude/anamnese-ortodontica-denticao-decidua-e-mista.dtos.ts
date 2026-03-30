export interface AnamneseOrtodonticaDenticaoDeciduaeMistaDTO {
    id: string
    utenteId: string 

    relacaoMolarDecidua: number | null
    dentaduraMista: string | null
    sequenciaEsfoliacao: string | null
    sequenciaErupcao: string | null
    estagioCalcificacao: string | null
}

export interface CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest {
    utenteId: string 

    relacaoMolarDecidua: number | null
    dentaduraMista: string | null
    sequenciaEsfoliacao: string | null
    sequenciaErupcao: string | null
    estagioCalcificacao: string | null
}

export interface UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest {
    utenteId: string 

    relacaoMolarDecidua: number | null
    dentaduraMista: string | null
    sequenciaEsfoliacao: string | null
    sequenciaErupcao: string | null
    estagioCalcificacao: string | null
}