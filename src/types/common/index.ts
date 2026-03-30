export interface BaseEntity {
  id: string
  createdOn?: string
  updatedOn?: string
}

export interface BaseResponse {
  succeeded: boolean
  messages: string[]
}

export interface BaseRequest {
  id?: string
}

export interface BaseDTO extends BaseRequest {
  id: string
}

export interface WithActive {
  ativo: boolean
}

export interface WithName {
  nome: string
}

export interface WithDescription {
  descricao: string
}
