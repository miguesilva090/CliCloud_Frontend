export type FechoDiarioTratamentoRequest = {
  data: string
}

export type FechoDiarioTratamentoResultDTO = {
  totalElegiveis: number
  totalProcessadas: number
  totalSessoesHistorico: number
  totalTratamentosFechados: number
  totalIgnoradas: number
  avisos: string[]
  erros: string[]
}
