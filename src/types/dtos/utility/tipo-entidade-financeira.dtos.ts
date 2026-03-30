export interface CreateTipoEntidadeFinanceiraDTO {
  sigla: string
  designacao: string
  dominio: string
  descricaoDominio: string
}

export interface UpdateTipoEntidadeFinanceiraDTO
  extends Omit<CreateTipoEntidadeFinanceiraDTO, 'id'> {
  id?: string
}

export interface TipoEntidadeFinanceiraDTO {
  id: string
  sigla: string
  designacao: string
  dominio: string
  descricaoDominio: string
  createdOn: Date
  lastModifiedOn?: Date | null
}

export interface TipoEntidadeFinanceiraTableDTO {
  id: string
  sigla: string
  designacao: string
  dominio: string
  descricaoDominio: string
  createdOn: Date
}

export interface TipoEntidadeFinanceiraLightDTO {
  id: string
  sigla: string
  designacao: string
  dominio: string
}

