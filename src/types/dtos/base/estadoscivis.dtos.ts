export interface UpdateEstadoCivilDTO extends Omit<CreateEstadoCivilDTO, 'id'> {
  id?: string
}

export interface EstadoCivilDTO {
  id: string
  nome: string
  createdOn: Date
}

export interface CreateEstadoCivilDTO {
  nome: string
}
