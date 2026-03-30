import { EstadoCivilClient } from './estado-civil-client'

export const EstadoCivilService = (idFuncionalidade = '') =>
  new EstadoCivilClient(idFuncionalidade)
