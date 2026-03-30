export interface CreateCodigoPostalDTO {
  codigo: string
  localidade: string
}

export interface UpdateCodigoPostalDTO
  extends Omit<CreateCodigoPostalDTO, 'id'> {
  id?: string
}

export interface CodigoPostalDTO {
  id: string
  codigo: string
  localidade: string
  createdOn: Date
}

// Table DTO for consistency with other entities (identical structure since no nested relationships)
export interface CodigoPostalTableDTO {
  id: string
  codigo: string
  localidade: string
  createdOn: Date
}

export interface CodigoPostalLightDTO {
  id: string
  codigo: string
  localidade: string
}
