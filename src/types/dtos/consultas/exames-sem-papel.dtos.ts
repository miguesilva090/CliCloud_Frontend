export type AreaPrestacaoOpcaoDTO = {
  codigo: string
  descricao: string
}

export type ExamesSemPapelContextoDTO = {
  portaLeitorCartoes: number | null
  temAssinaturaCarregada: boolean
  areaPrestacaoAssinarESPDefeito: string | null
  permitirElaborarRelatorioESP: boolean
  areasPrestacao: AreaPrestacaoOpcaoDTO[]
}

export type ExameSemPapelTabelaDTO = {
  id: string
  requisicaoNum: string
  utente: string
  area: string
  estado: string
  lotes: boolean
  medico: string
  isencaoTaxa: boolean
  comTaxa: boolean
  pnp: boolean
  assinado: boolean
  dataRequisicao: string
}

export type ExameSemPapelFiltroRequest = {
  searchUtente?: string | null
  dataInicio?: string | null
  dataFim?: string | null
  porAssinar: boolean
  apenasEfetuadosNaoPrescritos: boolean
  pageNumber: number
  pageSize: number
}

export type ExameSemPapelAssinaturaSessaoRequest = {
  cMedico: string
  tipoCartao: string
  digestValue: string
  signatureValue: string
  assinatura: string
  assinaturaSubCA: string
}

export type ExameSemPapelLoteRequest = {
  requisicoes: string[]
  areaPrestacao?: string | null
}

export type ExameSemPapelLoteResultadoDTO = {
  total: number
  sucesso: number
  falha: number
  mensagens: string[]
}
