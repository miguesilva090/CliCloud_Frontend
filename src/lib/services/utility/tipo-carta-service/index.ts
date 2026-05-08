import { TipoCartaClient } from './tipo-carta-client'

export const TipoCartaService = (idFuncionalidade = '') =>
  new TipoCartaClient(idFuncionalidade)
