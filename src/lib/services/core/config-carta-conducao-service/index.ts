import { ConfigCartaConducaoClient } from './config-carta-conducao-client'

export const ConfigCartaConducaoService = (idFuncionalidade = '') =>
  new ConfigCartaConducaoClient(idFuncionalidade)
