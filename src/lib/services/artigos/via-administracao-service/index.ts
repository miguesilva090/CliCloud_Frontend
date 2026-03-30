import { ViaAdministracaoClient } from './via-administracao-client'

export const ViaAdministracaoService = (idFuncionalidade = '') =>
  new ViaAdministracaoClient(idFuncionalidade)
