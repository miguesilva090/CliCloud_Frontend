import { SessaoTratamentoClient } from './sessao-tratamento-client'

export const SessaoTratamentoService = (
  idFuncionalidade = 'PClinico_Tratamentos'
) => new SessaoTratamentoClient(idFuncionalidade)

export * from './sessao-tratamento-client'
