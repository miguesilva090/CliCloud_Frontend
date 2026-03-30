import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface AtestadoTableFilterRequest extends TableFilterRequest {}

/** DTO completo de atestado (alinhado com backend AtestadoDTO) */
export interface AtestadoDTO {
  id: string
  utenteId: string
  medicoId: string
  clinicaId: string
  codigoPostalId?: string | null
  dataAtestado: string
  numeroSPMS?: string | null
  estadoEnvio: number
  dataEnvio?: string | null
  observacoes?: string | null
  numeroSNS?: string | null
  createdOn: string
  lastModifiedOn?: string | null
}

/** Linha da tabela de listagem de atestados (alinhado com backend AtestadoTableDTO) */
export interface AtestadoTableDTO {
  id: string
  utenteId: string
  nomeUtente?: string | null
  medicoId: string
  nomeMedico?: string | null
  clinicaId: string
  dataAtestado: string
  numeroSPMS?: string | null
  estadoEnvio: number
  dataEnvio?: string | null
  observacoes?: string | null
  numeroSNS?: string | null
  createdOn: string
}

/** Payload para criar atestado (POST /client/atestados/Atestado) */
export interface CreateAtestadoRequest {
  utenteId: string
  medicoId: string
  clinicaId: string
  codigoPostalId?: string | null
  dataAtestado: string
  numeroSPMS?: string | null
  observacoes?: string | null
  numeroSNS?: string | null
  categorias: CreateAtestadoCategoriaItem[]
  restricoes: CreateAtestadoRestricaoItem[]
  restricoesAnteriores: CreateAtestadoRestricaoAnteriorItem[]
}

export interface CreateAtestadoCategoriaItem {
  cartaConducaoId: string
  apto: number
  aptoGrupo2: number
}

export interface CreateAtestadoRestricaoItem {
  cartaConducaoRestricaoId: string
  cartaConducaoId: string
  anotacoes?: string | null
}

export interface CreateAtestadoRestricaoAnteriorItem {
  cartaConducaoRestricaoId: string
  anotacoes?: string | null
}
