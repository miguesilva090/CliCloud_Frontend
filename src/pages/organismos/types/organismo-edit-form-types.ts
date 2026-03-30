export interface EntidadeNaturezaItem {
  codigoEntidade: string
  natureza: string
}

export interface OrganismoEditFormValues {
  nome: string
  nomeComercial: string
  abreviatura: string
  email: string
  numeroContribuinte: string
  observacoes: string
  status: number
  telefone: string
  fax: string
  contacto: string
  globalbooking: boolean
  nacional: boolean
  codigoClinica: string
  localidade: string
  // Morada
  paisId: string
  distritoId: string
  concelhoId: string
  freguesiaId: string
  codigoPostalId: string
  rua: string
  ruaId: string
  numeroPorta: string
  andarRua: string
  // Outros Parâmetros
  categoria: string
  numeroPagamentos: string
  desconto: string
  descontoUtente: string
  prazoPagamento: string
  apolice: string
  avenca: string
  bancoId: string
  nib: string
  designaTratamentos: string
  dataInicioContrato: string
  dataFimContrato: string
  limitarConsultas: boolean
  numeroConsultas: string
  contabilizarFaltas: boolean
  faturaCredencial: number
  condicaoPagamento: string
  tipoModoPagamento: string
  assinarPagaDocumento: boolean
  admissaoCC: boolean
  inactivo: boolean
  discriminaServicos: boolean
  apresentarCredenciaisPrimeiraSessao: number
  apresentarCredenciaisTipoConsulta: number
  // Contabilidade
  contabContaFA: string
  contabTipoContaFA: string
  contabContaFR: string
  contabTipoContaFR: string
  // Informação SNS
  ars: string
  codigoRegiao: string
  codigoULSNova: string
  codigoFaturacao: string
  entidadeNatureza: EntidadeNaturezaItem[]
  // Faturação
  cServicoFaturaResumo: string
  faturarPorDatas: boolean
  trust: boolean
  adm: boolean
  sadgnr: boolean
  sadpsp: boolean
}

