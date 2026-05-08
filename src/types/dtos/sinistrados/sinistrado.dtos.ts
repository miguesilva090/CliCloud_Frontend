export interface SinistradoLinhaServicoDTO 
{
    id?: string
    tratamentoId?: string
    admissaoId?: string
    codigoServico: string
    designacaoServico?: string
    quantidade: number
    valorServico?: number
    valorContratado?: number
    dataServico?: string
    numeroFaturaInterno?: number 
    numeroTFatura?: string
    dataFatura?: string
}

export interface SinistradoTableDTO
{
    id: string
    codigoSinistro: string
    utenteId: string
    dataAcidente?: string
    estadoSinistroId?: string
    estadoSinistroDesignacao?: string
    historico: boolean
    createdOn?: string
}

export interface SinistradoDTO extends SinistradoTableDTO
{
    dataParticipacao?: string
    numeroProcesso?: string
    observacoes?: string
    relatorio?: string
    linhasServico: SinistradoLinhaServicoDTO[]
}

export interface CreateSinistradoRequest
{
    codigoSinistro: string
    utenteId: string
    estadoSinistroId?: string
    dataAcidente?: string
    dataParticipacao?: string
    numeroProcesso?: string
    observacoes?: string
    relatorio?: string
    linhasServico: SinistradoLinhaServicoDTO[]
}

export interface UpdateSinistradoRequest
{
    utenteId: string
    estadoSinistroId?: string
    dataAcidente?: string
    dataParticipacao?: string
    numeroProcesso?: string
    observacoes?: string
    relatorio?: string
    linhasServico: SinistradoLinhaServicoDTO[]

}



