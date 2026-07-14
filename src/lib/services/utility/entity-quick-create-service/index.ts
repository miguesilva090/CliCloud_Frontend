import { EntityQuickCreateClient } from './entity-quick-create-client'

export const EntityQuickCreateService = (idFuncionalidade = '') =>
  new EntityQuickCreateClient(idFuncionalidade)

export * from './entity-quick-create-client'
export * from './entity-quick-create-errors'
