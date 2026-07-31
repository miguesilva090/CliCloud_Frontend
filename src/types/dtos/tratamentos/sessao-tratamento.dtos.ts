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

export type SessaoTratamentoAllFilterRequest = AllFilterRequest
