import { ProfissaoClient } from './profissao-client'

export const ProfissaoService = (idFuncionalidade = '') =>
  new ProfissaoClient(idFuncionalidade)
export * from './profissao-errors'
export * from './profissao-client'
