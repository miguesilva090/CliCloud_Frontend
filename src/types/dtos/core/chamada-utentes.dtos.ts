export type ChamadaUtenteDadosDTO = {
  tipo: string
  referenciaId: string
  nomeUtente: string
  nomeProfissional?: string | null
  sala?: string | null
  senha?: string | null
  existeChamadaAtiva: boolean
  existeChamadaFeita: boolean
}

export type ChamarConsultaRequest = {
  sala?: string | null
}

export type ChamarSessaoTratamentoRequest = {
  sala?: string | null
  nomeTecnico?: string | null
}

export type ChamadaUtenteFilaItemDTO = {
  id: string
  tipo: string
  referenciaId: string
  nomeUtente: string
  nomeProfissional?: string | null
  sala?: string | null
  senha?: string | null
  dataHoraChamada: string
  estado: number
}
