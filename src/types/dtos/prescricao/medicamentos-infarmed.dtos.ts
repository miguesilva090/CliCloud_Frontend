export interface MedicamentoAutocompleteItemDto {
    codigo: string
    designacao: string
}

export interface MedicamentoListagemResumoItemDto {
    prodId: string
    embId: string
    cnpem: string
    nome: string
    dosagem?: string | null
    embalagem?: string | null 
    nrRegisto?: string | null
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    generico: boolean
    nomeCompleto?: string
}

export interface MedicamentoListagemResumoResultDto {
    items: MedicamentoListagemResumoItemDto[]
    page: number
    tipo: number
    totalCount?: number | null
    totalPages?: number | null
}

export interface MedicamentoPrecoDto {
    tipoPreco?: string | null
    preco?: number | null
    dataInicio?: string | null
    dataFim?: string | null
    ativo: boolean
    ativoMesSeguinte: boolean
}

export interface MedicamentoComparticipacaoDto {
    regimeExcecionalId?: number | null
    tipoRegime?: string | null
    regimeExcecional?: string | null
    nivelComparticipacao?: string | null
    percentComparticipacao?: number | null
}

export interface MedicamentoPrescricaoBaseCalculoDto {
    pvp?: number | null
    precoReferencia?: number | null
    pvpNotificado?: number | null
    pvpMax100Re?: number | null
    precoUnitario?: number | null
    taxaComparticipacao?: number | null
    grupoHomogeneoCod?: string | null
}

export interface MedicamentoPrescricaoOpcaoDto {
    cnpem: string
    nome: string
    dosagem?: string | null
    embalagem?: string | null
    generico: boolean 
    preco?: number | null
    percentComparticipacao?: number | null
    seleccionado: boolean
}

export interface MedicamentoPrescricaoLinhaDto {
    embId?: string | null
    prodId?: string | null
    cnpem: string
    nome: string
    dosagem?: string | null
    embalagem?: string | null
    nrRegisto?: string | null
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    generico: boolean
    precoPvp?: MedicamentoPrecoDto | null
    precoReferencia?: MedicamentoPrecoDto | null
    precoUnitario?: MedicamentoPrecoDto | null
    comparticipacaoEfectiva?: MedicamentoComparticipacaoDto | null
    taxaComparticipacaoEfectiva?: number | null
    patologiasConsideradas: number[]
    baseCalculo?: MedicamentoPrescricaoBaseCalculoDto | null
    prescritivelAmbulatorio: boolean
    prescritivelMesSeguinte: boolean
    grupoHomogeneo?: string | null
    opcoesEquivalentes: MedicamentoPrescricaoOpcaoDto[]
}

export interface MedicamentosListagemParams {
    nome?: string
    tipo?: number
    page?: number
    contar?: boolean
    tipoReceita?: number
    prescritivel?: boolean
}