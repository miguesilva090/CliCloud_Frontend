export interface EmpresaEditFormValues {
  nome: string
  email: string
  numeroContribuinte: string
  observacoes?: string
  status?: number

  telefone?: string
  fax?: string

  // Morada
  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  rua?: string
  ruaId?: string
  numeroPorta: string
  andarRua: string

  // Outros parâmetros
  prazoPagamento?: string
  desconto?: string
  descontoUtente?: string
  categoria?: string
  // Legado: CInstit (Organismo associado à Empresa)
  organismoId?: string
  // Legado: CClinica
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

