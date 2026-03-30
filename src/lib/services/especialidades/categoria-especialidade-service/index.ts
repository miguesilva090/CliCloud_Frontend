import { CategoriaEspecialidadeClient } from './categoria-especialidade-client'

export const CategoriaEspecialidadeService = (idFuncionalidade = 'client') =>
  new CategoriaEspecialidadeClient(idFuncionalidade)

