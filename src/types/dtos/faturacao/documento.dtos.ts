import type { PaginatedRequest } from '@/types/api/responses'

export type DocumentoLinhaDTO = {
  id: string
  numeroLinha: number
  codigoArtigo?: string | null
  servicoId?: string | null
  descricao: string
  quantidade: number
  precoUnitario: number
  percentagemDesconto?: number | null
  valorDesconto?: number | null
  totalLinha?: number | null
  taxaIvaPercentagem: number
  valorImposto?: number | null
}

export type DocumentoDTO = {
  id: string
  tipoDocumentoId: string
  tipoDocumento?: {
    abreviatura?: string | null
    descricao?: string | null
  } | null
  anoFiscal: number
  numeroDocumento: number
  numeroExibicao?: string | null
  data?: string | null
  utenteId?: string | null
  organismoId?: string | null
  totalDocumento?: number | null
  totalIva?: number | null
  totalDesconto?: number | null
  totalLiquido?: number | null
  estado?: number | null
  estadoDocumento?: number | null
  estadoDocumentoLabel?: string | null
  moduloOrigem?: number | null
  origemLabel?: string | null
  liquidado: boolean
  rectificado: boolean
  exportado: boolean
  anulado: boolean
  estaEmitido: boolean
  nomeCliente?: string | null
  moradaCliente?: string | null
  numeroContribuinteCliente?: string | null
  observacoes?: string | null
  documentoOrigemId?: string | null
  identificadorUnicoDocumentoOrigem?: string | null
  dataDocumentoOrigem?: string | null
  motivoAnulacao?: string | null
  dataAnulacao?: string | null
  globalHash?: string | null
  linhas: DocumentoLinhaDTO[]
  createdOn: string
  lastModifiedOn?: string | null
}

export type DocumentoLightDTO = {
  id: string
  tipoDocumentoAbreviatura: string | null
  numeroDocumento: number
  numeroExibicao?: string | null
  data?: string | null
  nomeCliente?: string | null
  totalLiquido?: number | null
  estado?: number | null
  liquidado: boolean
  anulado: boolean
}

export type DocumentoTableDTO = {
  id: string
  tipoDocumentoId: string
  tipoDocumentoAbreviatura?: string | null
  tipoSerie?: string | null
  anoFiscal: number
  numeroDocumento: number
  numeroExibicao?: string | null
  data?: string | null
  utenteId?: string | null
  utenteNome?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  totalDocumento?: number | null
  totalIva?: number | null
  totalDesconto?: number | null
  totalLiquido?: number | null
  estado?: number | null
  estadoDocumento?: number | null
  estadoDocumentoLabel?: string | null
  moduloOrigem?: number | null
  origemLabel?: string | null
  liquidado: boolean
  rectificado: boolean
  anulado: boolean
  estaEmitido: boolean
  nomeCliente?: string | null
  numeroContribuinteCliente?: string | null
  createdOn: string
}

export type DocumentoAllFilter = {
  filters?: Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}

export type DocumentoTableFilter = PaginatedRequest

export type DocumentoPrintDTO = {
  template: string
  isAnulado: boolean
  isEmitido: boolean
  tipoSerie: string
  numeroExibicao: string
}

export type EnviarDocumentoEmailRequest = {
  destinatarioOverride?: string
  assuntoOverride?: string
  mensagemOverride?: string
}

export type DocumentoLiquidacaoContextoDTO = {
  documentoId: string
  jaLiquidado: boolean
  isUtente: boolean
  utenteId?: string | null
  organismoId?: string | null
  totalLiquido: number
  numeroExibicao: string
}

export type DocumentoAdmissaoDetalheDTO = {
  admissaoId?: string | null
  consultaId?: string | null
  origem: string
  descricao: string
}

export type DocumentoDetalhesAdmissoesDTO = {
  documentoId: string
  itens: DocumentoAdmissaoDetalheDTO[]
}

export type AtualizarValidacaoTransporteRequest = {
  codigoValidacaoTransporte: string
  dataTransporte?: string | null
  horaTransporte?: string | null
}
