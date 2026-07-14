import { EstadoListaEsperaClient } from './estado-lista-espera-client'

export const EstadoListaEsperaService = (idFuncionalidade = '') =>
  new EstadoListaEsperaClient(idFuncionalidade)
export * from './estado-lista-espera-errors'
export * from './estado-lista-espera-client'
