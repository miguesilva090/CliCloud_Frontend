import { UtilityLookupsClient } from './lookups-client'

export const UtilityLookupsService = (idFuncionalidade: string) =>
  new UtilityLookupsClient(idFuncionalidade)

export * from './lookups-client'
export * from './address-quick-create-client'
export * from './lookups-errors'
export * from './address-quick-create-errors'
