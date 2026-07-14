import { TipoPagamentoClient } from './tipo-pagamento-client'

export const TipoPagamentoService = (idFuncionalidade = '') =>
  new TipoPagamentoClient(idFuncionalidade)
export * from './tipo-pagamento-errors'
export * from './tipo-pagamento-client'
