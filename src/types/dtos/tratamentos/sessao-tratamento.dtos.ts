import type { AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface SessaoTratamentoTableDTO {
  id: string
  tratamentoId: string
  numSessao?: number | null
  data?: string | null
  horaInic?: string | null
  duracao?: string | null
  pago?: number | null
  faturado?: number | null
  faltou?: number | null
  confirmado?: number | null
  efetuado?: number | null
  desmarcado?: number | null
  createdOn: string
  servicosCount: number
}

export interface SessaoTratamentoDTO {
  id: string
  createdOn: string
  lastModifiedOn?: string | null
  tratamentoId: string
  numSessao?: number | null
  data?: string | null
  horaInic?: string | null
  iHoraIni?: number | null
  duracao?: string | null
  iDuraca?: number | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  horaFisio?: string | null
  horaAux?: string | null
  horaOutro?: string | null
  duracaoFisio?: string | null
  duracaoAux?: string | null
  duracaoOutro?: string | null
  reciboId?: string | null
  dataRecibo?: string | null
  pago?: number | null
  faturado?: number | null
  faltou?: number | null
  compensaFalta?: number | null
  obsFalta?: string | null
  desmarcado?: number | null
  obs?: string | null
  observSessao?: string | null
  documentoId?: string | null
}

export interface CreateSessaoTratamentoRequest {
  tratamentoId: string
  numSessao?: number | null
  data?: string | null
  horaInic?: string | null
  duracao?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  horaFisio?: string | null
  horaAux?: string | null
  horaOutro?: string | null
  duracaoFisio?: string | null
  duracaoAux?: string | null
  duracaoOutro?: string | null
  faltou?: number | null
  obsFalta?: string | null
  sendEmail?: boolean
}

export type UpdateSessaoTratamentoRequest = CreateSessaoTratamentoRequest

export type SessaoTratamentoAllFilterRequest = AllFilterRequest
