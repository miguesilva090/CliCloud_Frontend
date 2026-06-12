import { ContaBancariaClient } from './conta-bancaria-client'

export const ContaBancariaService = (idFuncionalidade = '') =>
  new ContaBancariaClient(idFuncionalidade)
