export type ConfigReferenciaMbDTO = {
  id: string
  clinicaId: string
  valorMinimo: number
  prazoPagamento: number
  servicoUrl?: string | null
  codigoEntidade?: string | null
  subEntidade?: string | null
  chaveBackOffice?: string | null
  ifThenKey?: string | null
}

export type AtualizarConfigReferenciaMbRequest = {
  valorMinimo: number
  prazoPagamento: number
  servicoUrl?: string | null
  codigoEntidade?: string | null
  subEntidade?: string | null
  chaveBackOffice?: string | null
  ifThenKey?: string | null
}

export type ReferenciaMbTableDTO = {
  id: string
  clienteNome: string
  descricao: string
  mensagem?: string | null
  entidadeMb?: string | null
  referenciaCodigo?: string | null
  valor: number
  dataReferenciaGerada: string
  dataLimitePagamento?: string | null
  dataPagamento?: string | null
  liquidada: boolean
  anulada: boolean
  servico: string
}

export type AnularReferenciaMbRequest = {
  observacao: string
}
