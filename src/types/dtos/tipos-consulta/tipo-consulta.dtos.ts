export interface TipoConsultaDTO {
  id: string
  designacao: string
}

export interface TipoConsultaTableDTO extends TipoConsultaDTO {
  createdOn?: string
}
