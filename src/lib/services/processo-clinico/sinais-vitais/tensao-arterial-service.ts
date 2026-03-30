import { TensaoArterialClient } from './tensao-arterial-client'

export const TensaoArterialService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new TensaoArterialClient(idFuncionalidade)


