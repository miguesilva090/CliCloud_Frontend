import { PrioridadeClient } from './prioridade-client'

export const PrioridadeService = (idFuncionalidade = '') =>
  new PrioridadeClient(idFuncionalidade)
