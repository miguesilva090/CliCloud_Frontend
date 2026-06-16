export interface MotivoRetencaoLightDTO {
  id: string
  codigo: number
  descricao: string
  tipoImposto: string
}

export interface MotivoRetencaoTableDTO extends MotivoRetencaoLightDTO {
  createdOn: string
}

export interface MotivoRetencaoDTO extends MotivoRetencaoLightDTO {
  lastModifiedOn?: string | null
}

export interface MotivoRetencaoSaveBody {
  codigo: number
  descricao: string
  tipoImposto: string
}
