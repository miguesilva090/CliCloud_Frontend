import { TipoAdmissaoClient } from './tipo-admissao-client'

export const TipoAdmissaoService = (idFuncionalidade = '') =>
  new TipoAdmissaoClient(idFuncionalidade)
export * from './tipo-admissao-errors'
export * from './tipo-admissao-client'
