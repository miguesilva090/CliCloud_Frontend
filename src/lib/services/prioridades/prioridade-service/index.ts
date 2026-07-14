import { PrioridadeClient } from './prioridade-client'

export const PrioridadeService = (idFuncionalidade = '') =>
  new PrioridadeClient(idFuncionalidade)
export * from './prioridade-errors'
export * from './prioridade-client'
