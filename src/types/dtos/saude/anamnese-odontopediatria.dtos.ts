export interface AnamneseOdontopediatriaDTO {
    id: string
    utenteId: string 

    peso: number | null
    altura: number | null

    pesoPai: number | null
    alturaPai: number | null

    pesoMae: number | null
    alturaMae: number | null

    caracteristicasGeraisDesenvolvimento: number | null
    tipoAmamentacao: number | null
    observacaoCardiaca: number | null
    observacaoRespiracao: number | null
    observacaoDiccao: number | null

    observacoesAdicionais: string | null
}

export interface CreateAnamneseOdontopediatriaRequest {
    utenteId: string

    peso: number | null
    altura: number | null

    pesoPai: number | null
    alturaPai: number | null

    pesoMae: number | null
    alturaMae: number | null

    caracteristicasGeraisDesenvolvimento: number | null
    tipoAmamentacao: number | null
    observacaoCardiaca: number | null
    observacaoRespiracao: number | null
    observacaoDiccao: number | null

    observacoesAdicionais: string | null
}

export interface UpdateAnamneseOdontopediatriaRequest {
    utenteId: string

    peso: number | null
    altura: number | null

    pesoPai: number | null
    alturaPai: number | null

    pesoMae: number | null
    alturaMae: number | null

    caracteristicasGeraisDesenvolvimento: number | null
    tipoAmamentacao: number | null
    observacaoCardiaca: number | null
    observacaoRespiracao: number | null
    observacaoDiccao: number | null

    observacoesAdicionais: string | null
}