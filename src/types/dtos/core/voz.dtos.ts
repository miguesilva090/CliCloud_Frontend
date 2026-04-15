export type ConfiguracaoVozDTO = {
  id: string
  clinicaId: string
  ativo: boolean
  provider: string
  idiomaPadrao: string
  sttIdioma: string
  sttAtivo: boolean
  sttInterimResults: boolean
  sttContinuous: boolean
  sttAutoPontuacao: boolean
  sttConfidenceMin: number
  sttSilenceTimeoutMs: number
  sttMaxAlternatives: number
  sttProfanityFilter: boolean
  ttsAtivo: boolean
  ttsVoice?: string | null
  ttsRate: number
  ttsPitch: number
  ttsVolume: number
  timeoutMs: number
  maxDuracaoCapturaSegundos: number
}

export type AtualizarConfiguracaoVozRequest = {
  ativo: boolean
  provider: string
  idiomaPadrao: string
  sttIdioma: string
  sttAtivo: boolean
  sttInterimResults: boolean
  sttContinuous: boolean
  sttAutoPontuacao: boolean
  sttConfidenceMin: number
  sttSilenceTimeoutMs: number
  sttMaxAlternatives: number
  sttProfanityFilter: boolean
  ttsAtivo: boolean
  ttsVoice?: string | null
  ttsRate: number
  ttsPitch: number
  ttsVolume: number
  timeoutMs: number
  maxDuracaoCapturaSegundos: number
}

export type ConfiguracaoVozOpcaoDTO = {
  tipo: string
  codigo: string
  descricao: string
  ordem: number
}

export type ConfiguracaoVozOpcoesDTO = {
  idiomas: ConfiguracaoVozOpcaoDTO[]
  vozes?: ConfiguracaoVozOpcaoDTO[]
}
