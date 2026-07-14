import { IndiceMassaCorporalClient } from './indice-massa-corporal-client'

export const IndiceMassaCorporalService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new IndiceMassaCorporalClient(idFuncionalidade)

export * from './indice-massa-corporal-client'
export * from './indice-massa-corporal-errors'
