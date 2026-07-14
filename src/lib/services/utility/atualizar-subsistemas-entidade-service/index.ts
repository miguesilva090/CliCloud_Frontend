import { AtualizarSubsistemasEntidadeClient } from './atualizar-subsistemas-entidade-client'

export const AtualizarSubsistemasEntidadeService = (idFuncionalidade = '') =>
  new AtualizarSubsistemasEntidadeClient(idFuncionalidade)
export * from './atualizar-subsistemas-entidade-errors'
export * from './atualizar-subsistemas-entidade-client'
