import { TipoCartaClient } from './tipo-carta-client'

export const TipoCartaService = (idFuncionalidade = '') =>
  new TipoCartaClient(idFuncionalidade)
export * from './tipo-carta-errors'
export * from './tipo-carta-client'
