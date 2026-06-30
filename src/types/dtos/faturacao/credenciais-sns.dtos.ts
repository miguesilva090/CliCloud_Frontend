import type { PaginatedRequest } from '@/types/api/responses'

export type CredenciaisSnsModulo = 'especialidades' | 'fisioterapia' | 'exames'

export type CredenciaisSnsLoteTableDTO = {
  id: string
  indice: number
  numeroLote: number
  dataLote: string
  valorTaxa: number
  valor: number
  ano: number
  mes: number
  mesNome?: string | null
  codigoOrganismo: number
  organismoSigla?: string | null
  organismoNome?: string | null
  tipoLote: number
  tipoLoteDesignacao?: string | null
  tipoServico: number
  tipoServicoDesignacao?: string | null
}

export type CredenciaisSnsTableFilter = PaginatedRequest & {
  modulo?: CredenciaisSnsModulo
}

export type DeleteCredenciaisSnsRequest = {
  indices: number[]
}
