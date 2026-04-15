export interface SeparadorDTO {
  id: string
  nome: string
  codigo: string
  ordem: number
  ativo: boolean
  createdOn: string
  lastModifiedOn?: string | null
}

export interface SeparadorFichaClinicaDTO {
  separadorId: string
  nome: string
  codigo: string
  ordem: number
  origem: 'Base' | 'Personalizado'
  formularioId?: string | null
}

export interface CreateSeparadorRequest {
  nome: string
  ordem: number
  ativo: boolean
}

export interface UpdateSeparadorRequest {
  nome: string
  ordem: number
  ativo: boolean
}

export interface SeparadorVinculoDTO {
  id: string
  separadorId: string
  tipo: TipoVinculoSeparador
  entidadeId: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface CreateSeparadorVinculoRequest {
  separadorId: string
  tipo: TipoVinculoSeparador
  entidadeId: string
}

export interface SeparadorPersonalizadoDTO {
  id: string
  clinicaId: string
  nomeSeparador: string
  formularioId: string
  ordem: number
  ativo: boolean
  createdOn: string
  lastModifiedOn?: string | null
}

export interface CreateSeparadorPersonalizadoRequest {
  nomeSeparador: string
  formularioId: string
  ordem: number
  ativo: boolean
}

export interface UpdateSeparadorPersonalizadoRequest {
  nomeSeparador: string
  formularioId: string
  ordem: number
  ativo: boolean
}

export type TipoVinculoSeparador = 1 | 2

export interface SeparadorPersonalizadoVinculoDTO {
  id: string
  separadorPersonalizadoId: string
  tipo: TipoVinculoSeparador
  entidadeId: string
  createdOn: string
  lastModifiedOn?: string | null
}

export interface CreateSeparadorPersonalizadoVinculoRequest {
  separadorPersonalizadoId: string
  tipo: TipoVinculoSeparador
  entidadeId: string
}

