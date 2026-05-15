export enum ModoListagemAdmissao {
  Dia = 0,
  Pendentes = 1,
}

export enum OrigemAdmissao {
  Manual = 0,
  Marcacao = 1,
  Transferencia = 2,
}

export type AdmissaoServicoDTO = {
  id?: string
  servicoId?: string | null
  valorServico?: number | null
  codigoArtigo?: string | null
  nomeArtigo?: string | null
  valorArtigo?: number | null
  quantidade?: number | null
  margemMed?: number | null
  margemIns?: number | null
  recMed?: number | null
  recInst?: number | null
  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null
  ordem?: number | null
  dente?: string | null
  exameId?: string | null
  linha: number
  nCheque?: string | null
  electrocardiograma?: number | null
  valorUt?: number | null
}

export type AdmissaoTableDTO = {
  id: string
  data?: string | null
  horaInicio?: string | null
  utenteId: string
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoNome?: string | null
  especialidadeDesignacao?: string | null
  organismoNome?: string | null
  salaNome?: string | null
  credencial?: string | null
  tipoAdmissaoDesignacao?: string | null
  statusConsulta?: number | null
  confirmado?: boolean | null
  efetuado?: boolean | null
  ordem?: number | null
  origem: OrigemAdmissao
}

export type AdmissaoDTO = {
  id: string
  utenteId: string
  utenteNumero?: string | null
  utenteNome?: string | null
  consultaMarcacaoId?: string | null
  medicoId?: string | null
  especialidadeId?: string | null
  tecnicoId?: string | null
  funcionarioId?: string | null
  medicoExternoId?: string | null
  salaId?: string | null
  motivoConsultaId?: string | null
  tipoAdmissaoId?: string | null
  tipoConsultaId?: string | null
  organismoId?: string | null
  seguradoraId?: string | null
  tratamentoId?: string | null
  data?: string | null
  horaInicio?: string | null
  horaFim?: string | null
  horaChegada?: string | null
  statusConsulta?: number | null
  origem: OrigemAdmissao
  confirmado?: boolean | null
  efetuado?: boolean | null
  credencial?: string | null
  credencialExterna?: number | null
  numDestacavel?: string | null
  ordem?: number | null
  sinistrado?: number | null
  justificacao?: number | null
  motivoJustificacao?: string | null
  diagnostico?: string | null
  doencaPrincipalId?: string | null
  doencaPrincipalCodigo?: string | null
  doencaPrincipalTitulo?: string | null
  doencaSecundariaId?: string | null
  doencaSecundariaCodigo?: string | null
  doencaSecundariaTitulo?: string | null
  obs?: string | null
  dataHoraMarcacao?: string | null
  servicos: AdmissaoServicoDTO[]
}

export type CreateAdmissaoRequest = Omit<AdmissaoDTO, 'id' | 'utenteNumero' | 'utenteNome' | 'doencaPrincipalCodigo' | 'doencaPrincipalTitulo' | 'doencaSecundariaCodigo' | 'doencaSecundariaTitulo'>

export type UpdateAdmissaoRequest = CreateAdmissaoRequest

export type AdmissaoPaginatedRequest = {
  pageNumber: number
  pageSize: number
  modo: ModoListagemAdmissao
  filters?: Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}

export type FechoDiarioRequest = {
  data: string
}

export type FechoDiarioResultDTO = {
  totalProcessadas: number
  totalConsultasCriadas: number
  erros: string[]
}
