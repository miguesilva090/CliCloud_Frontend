import { ConcelhoDTO } from '../base/concelhos.dtos'

export interface CreateFreguesiaDTO {
  nome: string
  concelhoId: string
}

export interface UpdateFreguesiaDTO extends Omit<CreateFreguesiaDTO, 'id'> {
  id?: string
}

export interface FreguesiaDTO {
  id: string
  nome: string
  concelhoId: string
  concelho: ConcelhoDTO
  createdOn: Date
}

// Simplified DTOs for table view
export interface FreguesiaTablePaisDTO {
  id: string
  nome: string
  codigo: string
}

export interface FreguesiaTableDistritoDTO {
  id: string
  nome: string
  paisId: string | null
  pais: FreguesiaTablePaisDTO | null
}

export interface FreguesiaTableConcelhoDTO {
  id: string
  nome: string
  distritoId: string | null
  distrito: FreguesiaTableDistritoDTO | null
}

export interface FreguesiaTableDTO {
  id: string
  nome: string
  concelhoId: string | null
  concelho: FreguesiaTableConcelhoDTO | null
  createdOn: Date
}

export interface FreguesiaLightDTO {
  id: string
  nome: string
  concelhoId: string | null
  concelhoNome: string // Flattened from nested Concelho
}
