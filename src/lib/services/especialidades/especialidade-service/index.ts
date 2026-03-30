import { EspecialidadeClient } from './especialidade-client'

export const EspecialidadeService = (idFuncionalidade = '') =>
  new EspecialidadeClient(idFuncionalidade)
