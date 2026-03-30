export interface CreatePaisDTO {
  codigo: string
  nome: string
  prefixo: string
}

export interface UpdatePaisDTO extends Omit<CreatePaisDTO, 'id'> {
  id?: string
}

export interface PaisDTO {
  id: string
  codigo: string
  nome: string
  prefixo: string
  createdOn: Date
}

// Table DTO for paginated endpoint (identical to PaisDTO - no nested relationships)
export interface PaisTableDTO {
  id: string
  codigo: string
  nome: string
  prefixo: string
  createdOn: Date
}

export interface PaisLightDTO {
  id: string
  codigo: string
  nome: string
  prefixo: string
}
