export interface ReceitaLinhaDTO {
  id?: string
  ordem: number
  tipoLinha: number
  embId?: string | null
  cnpem?: string | null
  designacao: string
  descricaoEmbalagem?: string | null
  quantidade: number
  pvp?: number | null
  comparticipacao?: number | null
  valorUtente?: number | null
  posologia?: string | null
  posologiaQuantidadeUnidade?: string | null
  posologiaQuantidadeValor?: string | null
  posologiaFrequenciaUnidade?: string | null
  posologiaFrequenciaValor?: string | null
  posologiaDuracaoUnidade?: string | null
  posologiaDuracaoValor?: string | null
  posologiaInstrucoes?: string | null
  codValidade?: number | null
  dataValidade?: string | null
  codJustificacaoQuantidade?: string | null
  justificacaoQuantidade?: string | null
}

export interface ReceitaMedicaDTO {
  id: string
  utenteId: string
  medicoId: string
  clinicaId: string
  dataPrescricao: string
  tipoReceita: number
  desmaterializada: number
  numeroReceitaLocal?: string | null
  numeroReceita?: string | null
  enviada: number
  anulada: number
  receitaRenovavel: number
  numeroVias?: number | null
  prescricaoPorNome: number
  motivoPrescricaoNome?: number | null
  numeroBeneficiarioEfr?: string | null
  siglaEfr?: string | null
  localPrescricao?: string | null
  observacoes?: string | null
  estadoEnvio: number
  mensagemErro?: string | null
  linhas: ReceitaLinhaDTO[]
}

export interface ReceitaMedicaTableDTO {
  id: string
  dataPrescricao: string
  numeroReceitaLocal?: string | null
  numeroReceita?: string | null
  utenteId: string
  utenteNome?: string | null
  medicoId: string
  medicoNome?: string | null
  tipoReceita: number
  desmaterializada: number
  enviada: number
  anulada: number
  estadoEnvio: number
}

export interface CreateReceitaLinhaRequest {
  ordem: number
  tipoLinha: number
  embId?: string | null
  cnpem?: string | null
  designacao: string
  descricaoEmbalagem?: string | null
  quantidade: number
  pvp?: number | null
  comparticipacao?: number | null
  valorUtente?: number | null
  posologia?: string | null
  posologiaQuantidadeUnidade?: string | null
  posologiaQuantidadeValor?: string | null
  posologiaFrequenciaUnidade?: string | null
  posologiaFrequenciaValor?: string | null
  posologiaDuracaoUnidade?: string | null
  posologiaDuracaoValor?: string | null
  posologiaInstrucoes?: string | null
  codValidade?: number | null
  codJustificacaoQuantidade?: string | null
  justificacaoQuantidade?: string | null
}

export interface CreateReceitaMedicaRequest {
  utenteId: string
  medicoId: string
  dataPrescricao: string
  tipoReceita: number
  desmaterializada: number
  receitaRenovavel: number
  numeroVias?: number | null
  prescricaoPorNome: number
  motivoPrescricaoNome?: number | null
  numeroBeneficiarioEfr?: string | null
  siglaEfr?: string | null
  localPrescricao?: string | null
  observacoes?: string | null
  linhas: CreateReceitaLinhaRequest[]
}

export type UpdateReceitaMedicaRequest = CreateReceitaMedicaRequest

export interface AnularReceitaMedicaRequest {
  motivoCodigo: string
  motivoDescricao: string
}

export interface ReceitaMedicaTableFilterRequest {
  pageNumber: number
  pageSize: number
  filters?: Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}
