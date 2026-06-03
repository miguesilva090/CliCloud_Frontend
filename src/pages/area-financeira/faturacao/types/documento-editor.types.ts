import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'

export type TipoClienteDocumento = 'utente' | 'organismo'

/** Movimento do utente associado ao documento (legado grid Movimentos). */
export type MovimentoUtenteEditor = {
  key: string
  modulo: string
  admissaoId: string
  codigoAdmissao: string
}

export type DocumentoEditorState = {
  tipoDocumentoId: string
  tipoAbreviatura: string
  tipoDescricao: string
  anoFiscal: number
  dataDocumento: string
  dataVencimentoPagamento: string
  tipoSerie: 'N' | 'D' | 'M'
  condicaoPagamento?: number | null
  tipoModoPagamento?: number | null
  isentoIva: boolean
  motivoIsencaoId: string | null
  codigoValidacaoTransporte: string | null
  dataTransporte: string
  horaTransporte: string
  tipoCliente: TipoClienteDocumento
  utenteId: string | null
  organismoId: string | null
  nomeCliente: string
  moradaCliente: string
  localidadeCliente: string
  numeroContribuinteCliente: string
  codigoPostalId: string | null
  codigoPostalTexto: string
  /** Legado modFldBeneficiario (readonly na UI). */
  beneficiario: string
  /** Legado modFldLimiteCredito — só exibição, não grava na fatura. */
  limiteCreditoExibicao: string
  /** Legado modFldDataDeFaturaGlobal / Ate (readonly; modal fatura global em A1b). */
  faturaGlobalDesde: string
  faturaGlobalAte: string
  sinistradoId: string | null
  codigoSinistro: string
  observacoes: string
  moedaId: string | null
  moedaCodigo: string
  cambio: number
  bancoId: string | null
  movimentosUtente: MovimentoUtenteEditor[]
  regraFaturacao: number
  descontoCliente: number
  descontoPagamento: number
  percentagemDescontoGlobal: number
  ivaCaixa: boolean
  retencaoAtiva: boolean
  retencaoImposto: 'IRS' | 'IRC' | 'IS' | ''
  retencaoMotivo: string
  retencaoTaxa: number
  retencaoValor: number
  gerarReferenciaMb: 0 | 1 | 2
  outros: number
  documentoOrigemId: string | null
  identificadorUnicoDocumentoOrigem: string
  dataDocumentoOrigem: string
  linhas: EmitirDocumentoLinhaRequest[]
}

export type ResumoIvaLinha = {
  taxaIvaPercentagem: number
  valorIncidencia: number
  totalIva: number
}

export type DocumentoEditorTotais = {
  mercadorias: number
  descontos: number
  impostos: number
  total: number
  acerto: number
  retencao: number
  aPagar: number
  resumoIva: ResumoIvaLinha[]
  regraFaturacao: number
}
