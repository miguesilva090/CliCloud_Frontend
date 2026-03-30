export interface TipoDeDorLightDTO {
  id: string
  descricao: string
}

export interface TipoDeDorTableDTO {
  id: string
  descricao: string
  createdOn: string
}

export interface TipoDeDorDTO {
  id: string
  descricao: string
  createdOn: string
  lastModifiedOn?: string
}

export interface CreateTipoDeDorRequest {
  descricao: string
}

export interface UpdateTipoDeDorRequest {
  descricao: string
}

export interface DeleteMultipleTipoDeDorRequest {
  ids: string[]
}
