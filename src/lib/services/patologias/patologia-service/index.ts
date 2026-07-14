import { PatologiaClient } from './patologia-client'

export const PatologiaService = (idFuncionalidade = '') =>
  new PatologiaClient(idFuncionalidade)
export * from './patologia-errors'
export * from './patologia-client'
