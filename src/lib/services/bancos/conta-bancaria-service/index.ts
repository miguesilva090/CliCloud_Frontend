import { ContaBancariaClient } from './conta-bancaria-client'

export const ContaBancariaService = (idFuncionalidade = '') =>
  new ContaBancariaClient(idFuncionalidade)
export * from './conta-bancaria-errors'
export * from './conta-bancaria-client'
