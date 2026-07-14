import { TemperaturaCorporalClient } from './temperatura-corporal-client'

export const TemperaturaCorporalService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new TemperaturaCorporalClient(idFuncionalidade)

export * from './temperatura-corporal-client'
export * from './temperatura-corporal-errors'
