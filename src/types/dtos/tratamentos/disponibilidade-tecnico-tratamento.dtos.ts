export interface UnidadesTempoTecnicoResponse {
  tecnicoId: string
  maxTratamentos: number
  unidadesTempo: number[]
}

export interface HorasPossiveisTecnicoRequest {
  tecnicoId: string
  /** ISO date (parte date conta). */
  data: string
  unidadeTempo: number
  ignorarSessaoId?: string | null
}

export interface HorasPossiveisTecnicoResponse {
  duracao: string
  horas: string[]
}
