import { UtilityLookupsClient } from './lookups-client'

export const UtilityLookupsService = (idFuncionalidade: string) =>
  new UtilityLookupsClient(idFuncionalidade)

export * from './lookups-client'

