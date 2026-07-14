import { LocalTratamentoClient } from './local-tratamento-client'

export const LocalTratamentoService = (idFuncionalidade = '') =>
  new LocalTratamentoClient(idFuncionalidade)
export * from './local-tratamento-errors'
export * from './local-tratamento-client'
