import { ConfigCartaConducaoClient } from './config-carta-conducao-client'

export const ConfigCartaConducaoService = (idFuncionalidade = '') =>
  new ConfigCartaConducaoClient(idFuncionalidade)
export * from './config-carta-conducao-errors'
export * from './config-carta-conducao-client'
