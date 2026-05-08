export interface TipoCartaTableDTO {
  id: string
  descricao: string
  obs?: string
  caminho?: string
}

export interface TipoCartaCreateRequest {
  Descricao: string
  Obs?: string
  Caminho?: string
}

export interface TipoCartaUpdateRequest extends TipoCartaCreateRequest {}
