export type EmitirDocumentoLinhaRequest = {
    numeroLinha?: number
    descricao: string
    codigoArtigo?: string | null
    servicoId?: string | null
    admissaoServicoId?: string | null
    quantidade: number
    precoUnitario: number
    percentagemDesconto?: number | null
    valorDesconto?: number | null
    descontoTipo1?: number | null
    descontoTipo2?: number | null
    descontoTipo3?: number | null
    taxaIvaId?: string | null
    taxaIvaPercentagem: number
    motivoIsencaoId?: string | null
}

export type EmitirDocumentoRequest = {
    tipoDocumentoId: string
    anoFiscal: number
    dataDocumento?: string | null
    utenteId?: string | null
    organismoId?: string | null
    funcionarioId?: string | null
    nomeCliente: string
    moradaCliente: string
    localidadeCliente?: string | null
    numeroContribuinteCliente?: string | null
    codigoPostalId?: string | null
    condicaoPagamento?: number | null
    tipoModoPagamento?: number | null
    moedaId?: string | null
    bancoId?: string | null
    taxaCambio?: number | null
    tipoCambio?: number | null
    dataVencimentoPagamento?: string | null
    tipoSerie?: string | null
    descontoCliente?: number | null
    descontoPagamento?: number | null
    outros?: number | null
    isentoIva?: boolean
    ivaCaixa?: boolean
    motivoIsencaoId?: string | null
    rectificado?: boolean
    liquidado?: boolean
    anulado?: boolean
    caixaId?: number | null
    observacoes?: string | null
    codigoValidacaoTransporte?: string | null
    dataTransporte?: string | null
    horaTransporte?: string | null
    moduloOrigem?: number | null
    codigoTipoDocSaft?: number | null
    linhas: EmitirDocumentoLinhaRequest[]
    retencaoAtiva?: boolean
    retencaoImposto?: string | null
    retencaoTaxa?: number | null
    retencaoValor?: number | null
    retencaoMotivo?: string | null
    retencaoCodigoMotivo?: number | null
    percentagemDescontoGlobal?: number | null
    documentoOrigemId?: string | null
    identificadorUnicoDocumentoOrigem?: string | null
    dataDocumentoOrigem?: string | null
    gerarReferenciaMb?: number | null
}

export type EmitirDocumentoDesdeAdmissaoRequest = {
    tipoDocumentoId: string
    anoFiscal: number
    dataDocumento?: string | null
    dataVencimentoPagamento?: string | null
    funcionarioId?: string | null
    condicaoPagamento?: number | null
    tipoModoPagamento?: number | null
    moedaId?: string | null
    bancoId?: string | null
    descontoCliente?: number | null
    descontoPagamento?: number | null
    outros?: number | null
    isentoIva?: boolean
    ivaCaixa?: boolean
    pago?: boolean | null
    faturado?: boolean | null
    codigoTipoDocSaft?: number | null
    nomeCliente?: string | null
    moradaCliente?: string | null
    localidadeCliente?: string | null
    numeroContribuinteCliente?: string | null
}

export type EmitirDocumentoDesdeConsultaRequest = {
    tipoDocumentoId: string
    anoFiscal: number
    dataDocumento?: string | null
    dataVencimentoPagamento?: string | null
    funcionarioId?: string | null
    condicaoPagamento?: number | null
    tipoModoPagamento?: number | null
    moedaId?: string | null
    bancoId?: string | null
    descontoCliente?: number | null
    descontoPagamento?: number | null
    outros?: number | null
    isentoIva?: boolean
    ivaCaixa?: boolean
    pago?: boolean | null
    faturado?: boolean | null
    codigoTipoDocSaft?: number | null
    nomeCliente?: string | null
    moradaCliente?: string | null
    localidadeCliente?: string | null
    numeroContribuinteCliente?: string | null
}

export type AnularDocumentoRequest = {
    motivoAnulacao: string
    dataAnulacao?: string | null
    reverterEstadosClinicos?: boolean 
}

export type CriarNotaCreditoLinhaRequest = {
    documentoLinhaOrigemId: string
    quantidade: number
    precoUnitario?: number | null
    taxaIvaPercentagem?: number | null
}

export type CriarNotaCreditoRequest = {
    documentoOrigemId: string
    tipoDocumentoId: string
    anoFiscal: number
    dataDocumento?: string | null
    motivo: string 
    creditoTotal?: boolean
    linhas?: CriarNotaCreditoLinhaRequest[]
    reverterEstadosClinicos?: boolean
}

export type DocumentoEmissaoDTO = {
    id: string
    tipoDocumentoId: string
    anoFiscal: number
    numeroDocumento: number
    numeroExibicao?: string | null
    hashDocumento?: string | null
    versaoChave?: number | null
    referenciaMbEntidade?: string | null
    referenciaMbCodigo?: string | null
    referenciaMbWay?: boolean
}

export type PagamentoOpcaoDTO = {
    valor: number
    descricao: string
}

export type OpcaoTextoDTO = {
    valor: string
    descricao: string
}

export type DocumentoEmissaoOpcoesPagamentoDTO = {
    condicoesPagamento: PagamentoOpcaoDTO[]
    modosPagamento: PagamentoOpcaoDTO[]
    tiposSerie: OpcaoTextoDTO[]
    impostosRetencao: OpcaoTextoDTO[]
    referenciasMb: PagamentoOpcaoDTO[]
}