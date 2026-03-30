import { PatologiaClient } from './patologia-client'

export const PatologiaService = (idFuncionalidade = '') =>
  new PatologiaClient(idFuncionalidade)
