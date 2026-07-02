export type AdseComunicacaoModulo = 'tratamentos' | 'consultas' | 'exames'

export type AdseComunicacaoLinhaDTO = {
  id: string
  origemClinicaId: string
  documentoId: string
  coPagamentoId?: string | null
  numeroOrigem: string
  dataInicio?: string | null
  dataFim?: string | null
  numeroSessoes: number
  utenteId: string
  utenteNome: string
  numeroFatura: string
  dataFatura?: string | null
  valorFatura: number
  valorAdse: number
  preFatura?: string | null
  faturaAdse?: string | null
  estado: number
  estadoDescricao: string
  dataComunicacao?: string | null
  pdfFicheiro?: string | null
  pdfRelatorioFicheiro?: string | null
  erros?: string | null
  numeroDevolucao?: string | null
}

export type AdseComunicacaoPaginatedDTO = {
  linhas: AdseComunicacaoLinhaDTO[]
  totalFaturaPagina: number
  totalFatura: number
  totalAdsePagina: number
  totalAdse: number
  totalCount: number
  pageNumber: number
  pageSize: number
}

export type AdseComunicacaoTableFilter = {
  pageNumber: number
  pageSize: number
  sorting: { id: string; desc: boolean }[]
  dataInicial?: string | null
  dataFinal?: string | null
  estadoComunicacao?: number | null
  utenteId?: string | null
  devolucoes?: boolean
  numOrdemPreFatura?: number | null
}

export type AdsePreFaturaDTO = {
  id: string
  tipoPreFatura: string
  numOrdem: number
  codigo: string
  estado: number
  estadoDescricao: string
  dataAbertura: string
  dataFecho?: string | null
  valorTotal: number
  numDocumentos: number
  referenciaSerie?: string | null
  referenciaNumeroDocumento?: number | null
  referenciaData?: string | null
  pdfFicheiro?: string | null
  numeroFaturaReferencia: string
}

export type AdseComunicarDocumentosRequest = {
  tipoPreFatura: string
  numOrdemPreFatura: number
  operacao: number
  devolucoes: boolean
  linhas: { origemClinicaId: string; documentoId: string; numeroFatura: string }[]
}

export type AdseFecharPreFaturaRequest = {
  referenciaSerie: string
  referenciaNumeroDocumento: number
  referenciaData: string
  referenciaValor?: number | null
  pdfFicheiro?: string | null
}

export type AdseUploadPdfRequest = {
  documentoId: string
  origemClinicaId: string
  nomeFicheiro: string
  conteudoBase64: string
  relatorioMedico: boolean
}
