export interface MoedaLightDTO {
  id: string
  descricao: string
}

export interface MoedaTableDTO {
  id: string
  descricao: string
  plural?: string
  cambio: number
  abreviatura?: string
  centesimos?: string
  centesimoPlural?: string
  simbolo?: string
  createdOn: string
}
