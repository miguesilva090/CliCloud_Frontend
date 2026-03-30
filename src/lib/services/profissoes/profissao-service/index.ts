import { ProfissaoClient } from './profissao-client'

export const ProfissaoService = (idFuncionalidade = '') =>
  new ProfissaoClient(idFuncionalidade)
