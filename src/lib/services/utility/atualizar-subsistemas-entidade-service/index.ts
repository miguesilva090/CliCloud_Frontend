import { AtualizarSubsistemasEntidadeClient } from './atualizar-subsistemas-entidade-client'

export const AtualizarSubsistemasEntidadeService = (idFuncionalidade = '') =>
  new AtualizarSubsistemasEntidadeClient(idFuncionalidade)
