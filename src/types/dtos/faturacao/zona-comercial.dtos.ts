export interface ZonaComercialLightDTO {
  id: string
  codigo: number
  descricao: string
  autocompleteLabel?: string
}

export interface ZonaComercialTableDTO extends ZonaComercialLightDTO {
  createdOn: string
}

export interface ZonaComercialDTO extends ZonaComercialTableDTO {
  lastModifiedOn?: string | null
}

export interface ZonaComercialSaveBody {
  descricao: string
}
