import { ServicoTratamentoClient } from './servico-tratamento-client'

export const ServicoTratamentoService = (idFuncionalidade = 'PClinico_Tratamentos') =>
  new ServicoTratamentoClient(idFuncionalidade)
export * from './servico-tratamento-errors'
export * from './servico-tratamento-client'
