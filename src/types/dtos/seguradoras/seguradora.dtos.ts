export type SeguradoraTableDTO = {
    id: string
    nome?: string | null
    apolice?: string | null
    avenca?: number | null
    abreviatura?: string | null
    createdOn: string
}

export type SeguradoraDTO = SeguradoraTableDTO & {
    dataInicioContrato?: string | null
    dataFimContrato?: string | null
    bancoId?: string | null
    numeroIdentificacaoBancaria?: string | null
}

export type SeguradoraLightDTO = {
    id: string
    nome: string
    abreviatura?: string | null
}

export type SeguradoraTableFilterRequest = {
    pageNumber: number
    pageSize: number
    filters?: Array<{ id: string; value: string }>
    sorting?: Array<{ id: string; desc: boolean }>
}

export type CreateSeguradoraPayload = {
    Nome: string
    Apolice?: string | null
    Avenca?: number | null
    DataInicioContrato?: string | null
    DataFimContrato?: string | null
    Abreviatura?: string | null
    BancoId?: string | null
    NumeroIdentificacaoBancaria?: string | null
}

export type UpdateSeguradoraPayload = CreateSeguradoraPayload 