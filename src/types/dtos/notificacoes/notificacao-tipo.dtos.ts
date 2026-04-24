export interface NotificacaoTipoLightDTO {
  id: string
  designacaoTipo: string
}

export interface NotificacaoTipoTableDTO {
  id: string
  designacaoTipo: string
  reservadoSistema: boolean
  createdOn: string
}

export interface NotificacaoTipoDTO {
  id: string
  designacaoTipo: string
  reservadoSistema: boolean
  createdOn: string
  lastModifiedOn?: string | null
}
