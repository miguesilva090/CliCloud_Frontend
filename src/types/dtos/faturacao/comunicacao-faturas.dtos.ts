export type ComunicacaoFaturasTipoPreFatura = 'CA' | 'TA' | 'EX'

export type ComunicacaoFaturasModoListagem = 'pre-faturas' | 'devolucoes'

export type ComunicacaoFaturasRowDTO = {
  id: string
  tratamento?: string | null
  dataInicio?: string | null
  dataFim?: string | null
  numero?: string | null
  utente?: string | null
  numeroFr?: string | null
  dataFr?: string | null
  valorFr?: number | null
  valorAdse?: number | null
  preFatura?: string | null
  ftAdse?: string | null
  estado?: string | null
  comunicacao?: string | null
  temPdf?: boolean
  temRelatorio?: boolean
  erros?: string | null
}

export type ComunicacaoFaturasTotaisDTO = {
  totalFrPagina: number
  totalFr: number
  totalAdsePagina: number
  totalAdse: number
}

export type ComunicacaoFaturasFiltrosDTO = {
  dataInicial: string
  dataFinal: string
  estadoComunicacao?: string | null
  utenteId?: string | null
  modoListagem: ComunicacaoFaturasModoListagem
  numeroPreFatura?: string | null
  tipoPreFatura: ComunicacaoFaturasTipoPreFatura
}

export type PreFaturaEstado = 'Criada' | 'Aberta' | 'Fechada'

export type PreFaturaEstadoFiltro = 'criada' | 'aberta' | 'fechada'

export type PreFaturaTableDTO = {
  id: string
  numeroPreFatura: string
  dataAbertura?: string | null
  estado: PreFaturaEstado
  numeroDocsIncluidos?: number | null
  valorTotal?: number | null
  dataFecho?: string | null
  numeroSerieFatura?: string | null
  dataFatura?: string | null
  temPdf?: boolean
  temComprovativo?: boolean
}
