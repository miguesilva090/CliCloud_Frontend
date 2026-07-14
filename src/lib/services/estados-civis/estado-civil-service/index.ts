import { EstadoCivilClient } from './estado-civil-client'

export const EstadoCivilService = (idFuncionalidade = '') =>
  new EstadoCivilClient(idFuncionalidade)
export * from './estado-civil-errors'
export * from './estado-civil-client'
