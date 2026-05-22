export interface TipoConsultaDTO {
  id: string
  designacao: string
  codigoLegado?: number | null
}

export interface TipoConsultaTableDTO extends TipoConsultaDTO {
  createdOn?: string
}

export interface CreateTipoConsultaRequest {
  designacao: string
  codigoLegado?: number | null
}
