import { ModoPagamentoClient } from './modo-pagamento-client'

export const ModoPagamentoService = (idFuncionalidade = '') =>
  new ModoPagamentoClient(idFuncionalidade)
export * from './modo-pagamento-errors'
export * from './modo-pagamento-client'
