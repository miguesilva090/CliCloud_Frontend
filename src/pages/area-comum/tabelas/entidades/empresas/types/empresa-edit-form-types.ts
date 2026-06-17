export interface EmpresaEditFormValues {
  nome: string
  email: string
  numeroContribuinte: string
  observacoes?: string
  status?: number

  telefone?: string
  fax?: string

  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  rua?: string
  ruaId?: string
  numeroPorta: string
  andarRua: string

  prazoPagamento?: string
  desconto?: string
  descontoUtente?: string
  condicaoPagamentoId?: string
  modoPagamentoId?: string
  categoria?: string
  organismoId?: string
  codigoClinica?: string
  bancoId?: string
  numeroIdentificacaoBancaria?: string
  apolice?: string
  avenca?: string
  dataInicioContrato?: string
  dataFimContrato?: string
  numeroPagamentos?: string
  numeroTrabalhadores?: string
  valorTrabalhador?: string
  rescindindo?: boolean
}
