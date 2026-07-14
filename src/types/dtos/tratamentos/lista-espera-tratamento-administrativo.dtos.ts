import type { PaginationFilterRequest, TableFilter, TanstackSorting } from '@/types/dtos/common/table-filters.dtos'

export type ListaEsperaTratamentoTableDTO = {
  id: string
  ordem: number
  dataEntrada?: string | null
  utenteId: string
  utenteNome?: string | null
  designacao?: string | null
  numSessoes?: number | null
  prioridadeDesignacao?: string | null
  estadoDesignacao?: string | null
  credencial?: string | null
  validadeCredencial?: string | null
  localTratamentoDesignacao?: string | null
  organismoNome?: string | null
}

export type ListaEsperaTratamentoDTO = {
  id: string
  codigoLegado: number
  ordem: number
  dataEntrada?: string | null
  ordemOrigem?: number | null
  historico: boolean
  utenteId: string
  utenteNome?: string | null
  medicoId?: string | null
  medicoNome?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  prioridadeId?: string | null
  prioridadeDesignacao?: string | null
  estadoListaEsperaId?: string | null
  estadoDesignacao?: string | null
  localTratamentoId?: string | null
  localTratamentoDesignacao?: string | null
  patologiaId?: string | null
  patologiaDesignacao?: string | null
  sinistradoId?: string | null
  seguradoraId?: string | null
  designacao?: string | null
  numSessoes?: number | null
  horaDesejada?: string | null
  nFaltMax?: number | null
  nFaltComax?: number | null
  credencial?: string | null
  validadeCredencial?: string | null
  taxaModeradora?: number | null
  obs?: string | null
  tecObs?: string | null
  duracaoTotal?: string | null
  credencialExterna: boolean
  servicos?: ListaEsperaTratamentoServicoDTO[]
}

export type ListaEsperaTratamentoServicoDTO = {
  id: string
  servicoId?: string | null
  subsistemaServicoId?: string | null
  codigoServico?: string | null
  designacao?: string | null
  subsistemaDesignacao?: string | null
  duracao?: string | null
  ordem: number
}

export type ListaEsperaTratamentoServicoRequest = {
  servicoId?: string
  subsistemaServicoId?: string
  codigoServico?: string
  designacao?: string
  subsistemaDesignacao?: string
  duracao?: string
  ordem: number
}

export type ListaEsperaTratamentoProximoIdentificadorDTO = {
  codigoListaEspera: number
  proximaOrdem: number
}

export type ListaEsperaTratamentoPaginatedRequest = PaginationFilterRequest & {
  filters?: TableFilter[]
  sorting?: TanstackSorting
  historico?: boolean
  utenteId?: string
  medicoId?: string
  prioridadeId?: string
  localTratamentoId?: string
  estadoListaEsperaId?: string
}

export type CreateListaEsperaTratamentoRequest = {
  utenteId: string
  medicoId?: string
  organismoId?: string
  prioridadeId?: string
  estadoListaEsperaId?: string
  localTratamentoId?: string
  patologiaId?: string
  sinistradoId?: string
  seguradoraId?: string
  designacao?: string
  numSessoes?: number
  horaDesejada?: string
  nFaltMax?: number
  nFaltComax?: number
  credencial?: string
  validadeCredencial?: string
  taxaModeradora?: number
  obs?: string
  tecObs?: string
  duracaoTotal?: string
  credencialExterna?: boolean
  ordem?: number
  servicos?: ListaEsperaTratamentoServicoRequest[]
}

export type UpdateListaEsperaTratamentoRequest = Omit<
  CreateListaEsperaTratamentoRequest,
  'utenteId' | 'obs'
> & {
  ordem?: number
  servicos?: ListaEsperaTratamentoServicoRequest[]
}

export type ListaEsperaTratamentoObservacoesDTO = {
  observacoes: string
}

export type AppendListaEsperaTratamentoObservacaoRequest = {
  texto: string
}
