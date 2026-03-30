import { EstadoListaEsperaClient } from './estado-lista-espera-client'

export const EstadoListaEsperaService = (idFuncionalidade = '') =>
  new EstadoListaEsperaClient(idFuncionalidade)
