import { OrganismoClient } from './organismo-client'

export const OrganismoService = (idFuncionalidade = '') =>
  new OrganismoClient(idFuncionalidade)
export * from './organismo-errors'
export * from './organismo-client'
