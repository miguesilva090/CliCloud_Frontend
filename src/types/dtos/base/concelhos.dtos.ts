import { DistritoDTO } from './distritos.dtos'

export interface CreateConcelhoDTO {
  nome: string
  distritoId: string
}

export interface UpdateConcelhoDTO extends Omit<CreateConcelhoDTO, 'id'> {
  id?: string
}

export interface ConcelhoDTO {
  id: string
  nome: string
  distritoId: string
  distrito: DistritoDTO
  createdOn: Date
}

// Simplified DTOs for table view
export interface ConcelhoTablePaisDTO {
  id: string
  nome: string
  codigo: string
}

export interface ConcelhoTableDistritoDTO {
  id: string
  nome: string
  paisId: string | null
  pais: ConcelhoTablePaisDTO | null
}

export interface ConcelhoTableDTO {
  id: string
  nome: string
  distritoId: string | null
  distrito: ConcelhoTableDistritoDTO | null
  createdOn: Date
}

export interface ConcelhoLightDTO {
  id: string
  nome: string
  distritoId: string | null
  distritoNome: string // Flattened from nested Distrito
}
