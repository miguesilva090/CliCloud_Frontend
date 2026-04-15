export type ConfigCartaConducaoDTO = {
  id: string
  clinicaId: string
  urlOnline?: string | null
  urlOffline?: string | null
  utilizador?: string | null
  password?: string | null
  autoridadeSaudePublica: number
}

export type AtualizarConfigCartaConducaoRequest = {
  urlOnline: string
  urlOffline: string
  utilizador: string
  password: string
  autoridadeSaudePublica: number
}
