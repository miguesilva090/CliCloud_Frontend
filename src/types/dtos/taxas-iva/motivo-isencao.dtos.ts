export interface MotivoIsencaoLightDTO {
  id: string
  codigo: string
  codigoSaft?: string | null
  descricao: string
  norma?: string | null
  mencao?: string | null
}

export interface MotivoIsencaoTableDTO {
  id: string
  codigo: string
  codigoSaft?: string | null
  descricao: string
  norma?: string | null
  mencao?: string | null
  createdOn: string
}

export interface MotivoIsencaoDTO {
  id: string
  codigo: string
  codigoSaft?: string | null
  descricao: string
  norma?: string | null
  mencao?: string | null
  createdOn: string
  lastModifiedOn?: string | null
}

export type MotivoIsencaoSaveBody = {
  codigo: string
  codigoSaft: string
  descricao: string
  norma?: string | null
  mencao?: string | null
}
