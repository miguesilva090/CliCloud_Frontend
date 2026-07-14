import { TensaoArterialClient } from './tensao-arterial-client'

export const TensaoArterialService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new TensaoArterialClient(idFuncionalidade)

export * from './tensao-arterial-client'
export * from './tensao-arterial-errors'
