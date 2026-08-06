export interface PesquisaVagaRequest {
    dataInicio: string
    hora: string
    numeroSessoes: number
    unidadeTempo: number
    diasConsecutivos: boolean
    diasSemana?: number[]
    tiposTecnico?: number[]
}

export interface PesquisaVagaTecnicoDTO {
    tecnicoId: string
    nome: string
    tipoTecnico: number
}

export interface PesquisaVagaResponse {
    fisioterapeutas: PesquisaVagaTecnicoDTO[]
    auxiliares: PesquisaVagaTecnicoDTO[]
    outros: PesquisaVagaTecnicoDTO[]   
}