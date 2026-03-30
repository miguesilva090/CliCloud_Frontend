/**
 * DTOs de contactos de entidade (Utility.EntidadeContactoService).
 */

export interface EntidadeContactoDTO {
  id: string
  entidadeContactoTipoId: number
  entidadeId: string
  valor?: string | null
  principal: boolean
  createdOn: string
}

export interface CreateEntidadeContactoItemRequest {
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

export interface UpsertEntidadeContactoItemRequest {
  id?: string | null
  entidadeContactoTipoId: number
  valor: string
  principal: boolean
}

