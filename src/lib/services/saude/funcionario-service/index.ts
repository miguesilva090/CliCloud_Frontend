import { FuncionarioClient } from './funcionario-client'

export const FuncionarioService = (idFuncionalidade = '') =>
  new FuncionarioClient(idFuncionalidade)
export * from './funcionario-errors'
export * from './funcionario-client'
