import { TipoAdmissaoClient } from './tipo-admissao-client'

export const TipoAdmissaoService = (idFuncionalidade = '') =>
  new TipoAdmissaoClient(idFuncionalidade)

