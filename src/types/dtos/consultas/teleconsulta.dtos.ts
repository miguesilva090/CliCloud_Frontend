export type TeleconsultaSessaoDTO = {
  id: string
  clinicaId: string
  consultaMarcacaoId: string
  meetingId: string
  meetingUrl: string
  provider: string
  status: string
  inicioPrevistoUtc: string
  fimPrevistoUtc: string
  inicioEfetivoUtc?: string | null
  fimEfetivoUtc?: string | null
  ativo: boolean
}

export type CriarTeleconsultaRequest = {
  consultaMarcacaoId: string
  inicioPrevistoUtc?: string | null
  duracaoMinutos?: number | null
}

export type EntrarTeleconsultaRequest = {
  papel: string
  nomeExibicao?: string | null
  codigoAcesso?: string | null
}

export type TeleconsultaJoinDTO = {
  sessaoId: string
  meetingId: string
  meetingUrl: string
  papel: string
  moderador?: boolean
  expiraEmUtc?: string
}

export type GerarLinkUtenteRequest = {
  nomeExibicao?: string | null
  destino?: string | null
}
