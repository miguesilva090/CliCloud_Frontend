import type { PaginationFilterRequest, TableFilter, TanstackSorting } from '@/types/dtos/common/table-filters.dtos'

export type MarcacaoAdministrativoTableDTO = {
  id: string
  data?: string | null
  horaInicio?: string | null
  horaFim?: string | null
  utenteNumero?: string | null
  utenteNome?: string | null
  medicoNome?: string | null
  especialidadeDesignacao?: string | null
  organismoNome?: string | null
  statusConsulta?: number | null
  statusConsultaLabel?: string | null
}

export type MarcacaoAdministrativoDTO = {
  id: string
  utenteId: string
  medicoId?: string | null
  especialidadeId?: string | null
  organismoId?: string | null
  data?: string | null
  horaInicio?: string | null
  horaFim?: string | null
  tipoConsultaId?: string | null
  tipoAdmissaoId?: string | null
  credencial?: string | null
  obs?: string | null
  statusConsulta?: number | null
  confirmado?: boolean | null
  efetuado?: boolean | null
  utenteNome?: string | null
  utenteNumero?: string | null
  medicoNome?: string | null
  especialidadeDesignacao?: string | null
  tipoConsultaDesignacao?: string | null
  salaId?: string | null
  salaNome?: string | null
  admissaoId?: string | null
}

export type SalasDisponiveisRequest = {
  data: string
  horaInicio: string
  clinicaId?: string
}

export type SalaDisponivelDTO = {
  id: string
  nome: string
  numeroSala: number
  clinicaId: string
  ativa: boolean
  disponivel: boolean
}

export type AssociarSalaMarcacaoRequest = {
  salaId: string
}

export type MarcacaoAdministrativoPaginatedRequest = PaginationFilterRequest & {
  filters?: TableFilter[]
  sorting?: TanstackSorting
  dataDe?: string
  dataAte?: string
  horaDe?: string
  horaAte?: string
  medicoId?: string
  utenteId?: string
  especialidadeId?: string
  organismoId?: string
  apenasAtivas?: boolean
}

export type CreateMarcacaoAdministrativoRequest = {
  utenteId: string
  medicoId?: string
  especialidadeId?: string
  data: string
  horaInicio: string
  horaFim?: string
  organismoId?: string
  tipoConsultaId?: string
  tipoAdmissaoId?: string
  credencial?: string
  obs?: string
}

export type UpdateMarcacaoAdministrativoRequest = CreateMarcacaoAdministrativoRequest

export type DesmarcarMarcacaoAdministrativoRequest = {
  motivo: string
}

export type MudarHorarioMarcacaoAdministrativoRequest = {
  data: string
  horaInicio: string
  horaFim?: string
}

/** Fase 1c — calendário agenda (legado calendarioMarcacoesMedicoLst). */
export type MarcacaoCalendarioRequest = {
  medicoId: string
  especialidadeId?: string
  dataDe: string
  dataAte: string
}

export type MarcacaoCalendarioConfigDTO = {
  intervaloMarcacao: string
  primeiraConsulta?: string | null
  limiteManha: string
  limiteTarde: string
  /** FullCalendar 0=Dom … 6=Sáb (legado businessHours dow). */
  diasUteis?: number[]
  /** Dias ocultos no calendário (legado hiddenDays). */
  diasOcultos?: number[]
}

export type DisponibilidadeMedicosMesRequest = {
  especialidadeId: string
  mes: number
  ano: number
}

export type DisponibilidadeMedicoDiaEventoDTO = {
  id: number
  title: string
  medicoId: string
  start: string
  end: string
}

export type MarcacaoCalendarioEventoDTO = {
  id: string
  title: string
  start: string
  end: string
  tipoEvento: string
  marcacaoId?: string | null
  codigoLegadoTipoConsulta?: number | null
  salaCodigo?: string | null
}

export type MarcacaoCalendarioDTO = {
  config: MarcacaoCalendarioConfigDTO
  eventos: MarcacaoCalendarioEventoDTO[]
}
