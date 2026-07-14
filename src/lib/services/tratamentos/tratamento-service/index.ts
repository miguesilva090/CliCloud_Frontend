import { TratamentoClient } from './tratamento-client'

export const TratamentoService = (idFuncionalidade = 'PClinico_Tratamentos') =>
  new TratamentoClient(idFuncionalidade)
export * from './tratamento-errors'
export * from './tratamento-client'
