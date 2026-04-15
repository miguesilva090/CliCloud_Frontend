export type ConfiguracaoEmailDTO = {
  id: string
  clinicaId: string
  username: string
  server: string
  password: string
  porta: number
  useSSL: boolean
  tipoServico: number
  inbox?: string | null
  outbox?: string | null
  email?: string | null
  displayName?: string | null
  permitirEliminarEmail: boolean
}

export type AtualizarConfiguracaoEmailRequest = {
  username: string
  server: string
  password: string
  porta: number
  useSSL: boolean
  tipoServico: number
  inbox?: string | null
  outbox?: string | null
  email?: string | null
  displayName?: string | null
  permitirEliminarEmail: boolean
}

export type ConfiguracaoEmailAutomaticaDTO = {
  id: string
  clinicaId: string
  codigo: string
  descricao: string
  ativo: number
  diasantecedencia: number
  textomensagem: string
}

export type AtualizarConfiguracaoEmailAutomaticaRequest = {
  codigo: string
  descricao: string
  ativo: number
  diasantecedencia: number
  textomensagem: string
}

export type HistoricoEmailTabelaDTO = {
  id: string
  clinicaId: string
  assuntoEmail?: string | null
  corpoEmail: string
  emailDestino?: string | null
  nomeUtente?: string | null
  contacto?: string | null
  dataHoraCriacao: string
  dataHoraEnvio?: string | null
  status: string
  mensagemErro?: string | null
  modulo: string
}

export type HistoricoEmailTabelaFiltro = {
  pageNumber: number
  pageSize: number
  filters: Array<{ id: string; value: string }>
}

export type TemplatesFluxoEmailItemDTO = {
  codigo: string
  descricao: string
  assunto: string
  conteudo: string
  ativo: number
}

export type TemplatesFluxoEmailDTO = {
  templates: TemplatesFluxoEmailItemDTO[]
}

export type AtualizarTemplatesFluxoEmailItemRequest = {
  codigo: string
  descricao: string
  assunto: string
  conteudo: string
  ativo: number
}

export type AtualizarTemplatesFluxoEmailRequest = {
  templates: AtualizarTemplatesFluxoEmailItemRequest[]
}
