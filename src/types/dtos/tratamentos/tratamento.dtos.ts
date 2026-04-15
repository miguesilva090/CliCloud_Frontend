import type { AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface TratamentoTableDTO {
  id: string
  designacao?: string | null
  utenteId?: string | null
  medicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  dataInic?: string | null
  dataFim?: string | null
  numSessao?: number | null
  pago?: number | null
  faturado?: number | null
  suspenso?: number | null
  createdOn: string
  sessoesCount: number
  servicosCount: number
  organismoNome?: string | null
  localTratamentoNome?: string | null
  medicoNome?: string | null
  nomePatologia?: string | null
  vemListEsp?: number | null
}

export interface TratamentoAllFilterRequest extends AllFilterRequest {}

export interface CreateTratamentoRequest {
  utenteId: string
  medicoId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  tratamentoPredId?: string | null
  localOrigemId?: string | null

  designacao?: string | null
  numSessao?: number | null
  dataInic?: string | null
  confDfim?: number | null
  dataFim?: string | null
  data?: string | null

  preco?: number | null
  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null
  pago?: number | null
  faturado?: number | null

  obs?: string | null
  nomePatologia?: string | null
  sendEmail?: boolean
}

export interface TratamentoDTO {
  id: string
  createdOn: string
  lastModifiedOn?: string | null
  utenteId?: string | null
  medicoId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  tratamentoPredId?: string | null
  localOrigemId?: string | null
  designacao?: string | null
  numSessao?: number | null
  dataInic?: string | null
  confDfim?: number | null
  dataFim?: string | null
  data?: string | null
  obs?: string | null
  tecObs?: string | null
  nomePatologia?: string | null
}

