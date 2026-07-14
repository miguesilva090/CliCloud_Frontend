import { EspecialidadeClient } from './especialidade-client'

export const EspecialidadeService = (idFuncionalidade = '') =>
  new EspecialidadeClient(idFuncionalidade)
export * from './especialidade-errors'
export * from './especialidade-client'
