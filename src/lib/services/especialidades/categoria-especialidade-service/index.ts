import { CategoriaEspecialidadeClient } from './categoria-especialidade-client'

export const CategoriaEspecialidadeService = (idFuncionalidade = 'client') =>
  new CategoriaEspecialidadeClient(idFuncionalidade)
export * from './categoria-especialidade-errors'
export * from './categoria-especialidade-client'
