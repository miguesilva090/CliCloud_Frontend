export type ConfiguracaoTeleconsultaDTO = {
  id: string
  clinicaId: string
  ativo: boolean
  provider: string
  baseMeetingUrl: string
  jwtAtivo: boolean
  jwtAppId?: string | null
  jwtApiKey?: string | null
  jwtKid?: string | null
  jwtPrivateKey?: string | null
  janelaEntradaMinutosAntes: number
  duracaoPadraoMinutos: number
  permitirEntradaAntesDoInicio: boolean
  lobbyAtivo: boolean
}

export type AtualizarConfiguracaoTeleconsultaRequest = {
  ativo: boolean
  provider: string
  baseMeetingUrl: string
  jwtAtivo: boolean
  jwtAppId?: string | null
  jwtApiKey?: string | null
  jwtKid?: string | null
  jwtPrivateKey?: string | null
  janelaEntradaMinutosAntes: number
  duracaoPadraoMinutos: number
  permitirEntradaAntesDoInicio: boolean
  lobbyAtivo: boolean
}
