export interface MarcacaoAutomaticaPreviewRequest {
    listaEsperaTratamentoId: string
    dataInicio: string
    numeroSessoes: number
    intervaloDias: number
    diasSemanaPermitidos?: number[]

    fisioterapeutaId?: string | null
    unidadeTempoFisio?: number | null

    auxiliarId?: string | null
    unidadeTempoAux?: number | null

    outroTecnicoId?: string | null
    unidadeTempoOutro?: number | null
}

export interface MarcacaoAutomaticaConfirmRequest extends MarcacaoAutomaticaPreviewRequest {
    provisorio: boolean
}

export interface MarcacaoAutomaticaSessaoPreviewDTO {
    numSessao: number
    data: string
    horaInic: string
}

export interface MarcacaoAutomaticaPreviewResponse {
    listaEsperaTratamentoId: string
    utenteNome: string
    numeroSessoesPedido: number
    numeroSessoesGeradas: number
    duracao?: string | null
    sessoes: MarcacaoAutomaticaSessaoPreviewDTO[]
}