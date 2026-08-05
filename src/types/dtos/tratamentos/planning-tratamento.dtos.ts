export interface PlanningSessoesRequest {
    tecnicoId: string
    tipoTecnico: number
    dataDe: string
    dataAte: string
}

export interface PlanningSessaoEventoDTO {
    sessaoId: string
    tratamentoId: string
    title: string
    start: string
    end: string
    tipoEvento: number
    numSessao?: number | null
    horaInicio?: string | null
    duracao?: string | null
    utenteNome?: string | null
    tratamentoDesignacao?: string | null
    numSessoesTratamento?: number | null
    nFaltas?: number | null
    dataInicTratamento?: string | null
    dataFimTratamento?: string | null
    faltou: boolean
    confirmado: boolean
    efetuado: boolean
}

export interface PlanningSessoesResponse {
    eventos: PlanningSessaoEventoDTO[]
}