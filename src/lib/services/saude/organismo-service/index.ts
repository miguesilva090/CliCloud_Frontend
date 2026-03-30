import { OrganismoClient } from './organismo-client'

export const OrganismoService = (idFuncionalidade = '') =>
  new OrganismoClient(idFuncionalidade)
