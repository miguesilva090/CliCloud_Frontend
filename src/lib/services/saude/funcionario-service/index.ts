import { FuncionarioClient } from './funcionario-client'

export const FuncionarioService = (idFuncionalidade = '') =>
  new FuncionarioClient(idFuncionalidade)
