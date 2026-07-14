import { ViaAdministracaoClient } from './via-administracao-client'

export const ViaAdministracaoService = (idFuncionalidade = '') =>
  new ViaAdministracaoClient(idFuncionalidade)
export * from './via-administracao-errors'
export * from './via-administracao-client'
