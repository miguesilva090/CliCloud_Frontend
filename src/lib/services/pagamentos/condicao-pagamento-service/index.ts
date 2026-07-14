import { CondicaoPagamentoClient } from './condicao-pagamento-client'

export const CondicaoPagamentoService = (idFuncionalidade = '') =>
  new CondicaoPagamentoClient(idFuncionalidade)
export * from './condicao-pagamento-errors'
export * from './condicao-pagamento-client'
