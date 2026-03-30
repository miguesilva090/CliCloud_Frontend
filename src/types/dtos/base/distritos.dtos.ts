import { PaisDTO } from './paises.dtos'

export interface CreateDistritoDTO {
  nome: string
  paisId: string
}

export interface UpdateDistritoDTO extends Omit<CreateDistritoDTO, 'id'> {
  id?: string
}

export interface DistritoDTO {
  id: string
  nome: string
  paisId: string
  pais: PaisDTO
  createdOn: Date
}

// Lightweight Pais for table views (id, nome, and codigo)
export interface DistritoTablePaisDTO {
  id: string
  nome: string
  codigo: string
}

// Optimized DTO for paginated table endpoint
export interface DistritoTableDTO {
  id: string
  nome: string
  paisId: string | null
  pais: DistritoTablePaisDTO | null
  createdOn: Date
}

export interface DistritoLightDTO {
  id: string
  nome: string
  paisId: string | null
  paisNome: string // Flattened from nested Pais
}
