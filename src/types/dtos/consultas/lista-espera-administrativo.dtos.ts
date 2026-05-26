import type { PaginationFilterRequest, TableFilter, TanstackSorting } from '@/types/dtos/common/table-filters.dtos'

export type ListaEsperaTableDTO = {
  id: string
  utenteId: string
  utenteNumero?: string | null
  utenteNome?: string | null
  utenteTelefone?: string | null
  medicoNome?: string | null
  especialidadeDesignacao?: string | null
  organismoNome?: string | null
  prioridadeDesignacao?: string | null
  tipoConsultaDesignacao?: string | null
  data?: string | null
  horaInicio?: string | null
  credencial?: string | null
  obs?: string | null
  convertido: boolean
  consultaMarcacaoId?: string | null
}

export type ListaEsperaDTO = {
  id: string
  utenteId: string
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoId?: string | null
  medicoNome?: string | null
  especialidadeId?: string | null
  especialidadeDesignacao?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  prioridadeId?: string | null
  prioridadeDesignacao?: string | null
  tipoConsultaId?: string | null
  tipoConsultaDesignacao?: string | null
  data?: string | null
  horaInicio?: string | null
  horaFim?: string | null
  credencial?: string | null
  obs?: string | null
  consultaMarcacaoId?: string | null
  convertidoEm?: string | null
}

export type ListaEsperaPaginatedRequest = PaginationFilterRequest & {
  filters?: TableFilter[]
  sorting?: TanstackSorting
  medicoId?: string
  /** Filtro legado c_medico (agenda): médico + LE sem médico mesma esp. + LE sem médico/esp. */
  medicoAgendaId?: string
  utenteId?: string
  especialidadeId?: string
  prioridadeId?: string
  dataDe?: string
  dataAte?: string
  incluirConvertidos?: boolean
}

export type CreateListaEsperaRequest = {
  utenteId: string
  medicoId?: string
  especialidadeId: string
  organismoId?: string
  prioridadeId?: string
  tipoConsultaId?: string
  data: string
  horaInicio?: string
  horaFim?: string
  credencial?: string
  obs?: string
}

export type UpdateListaEsperaRequest = CreateListaEsperaRequest

export type ListaEsperaObservacoesDTO = {
  observacoes: string
}

export type AppendListaEsperaObservacaoRequest = {
  texto: string
}

export type ConverterListaEsperaMarcacaoRequest = {
  dataMarcacao?: string
  horaInicio: string
  horaFim?: string
  tipoAdmissaoId?: string
  obs?: string
  manterNaListaEspera: boolean
}

export type ConverterListaEsperaMarcacaoResultDTO = {
  listaEsperaId: string
  consultaMarcacaoId: string
}
