import { TipoPagamentoClient } from './tipo-pagamento-client'

export const TipoPagamentoService = (idFuncionalidade = '') =>
  new TipoPagamentoClient(idFuncionalidade)
