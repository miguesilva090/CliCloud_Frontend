import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface MarcacaoConsultaTableDTO {
  id: string
  consultaId?: string | null
  utenteId: string
  medicoId?: string | null
  especialidadeId?: string | null
  data?: string | null
  horaMarcacao?: string | null
  motivoConsultaId?: string | null
  tipoAdmissaoId?: string | null
  statusConsulta?: number | null
  utenteNumero?: string | null
  utenteNome?: string | null
  organismoCodigo?: string | null
  organismoNome?: string | null
  /** Preenchido pelo backend (yyyy-MM-dd) */
  dataLabel?: string | null
  /** Preenchido pelo backend (HH:mm) */
  horaMarcacaoLabel?: string | null
  /** Preenchido pelo backend (Display do enum StatusConsulta) */
  statusConsultaLabel?: string | null
  createdOn: string
}

export interface MarcacaoConsultaTableFilterRequest extends TableFilterRequest {}
export interface MarcacaoConsultaAllFilterRequest extends AllFilterRequest {}

/** Body para PUT Marcação (atualizar). */
export interface UpdateMarcacaoConsultaBody {
  consultaId?: string | null
  utenteId: string
  medicoId?: string | null
  especialidadeId?: string | null
  data: string
  horaInic: string
  horaFim?: string | null
  obs?: string | null
  organismoId?: string | null
  motivoConsultaId?: string | null
  tipoAdmissaoId?: string | null
  tipoConsultaId?: string | null
}

