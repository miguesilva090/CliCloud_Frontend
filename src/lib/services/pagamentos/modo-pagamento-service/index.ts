import { ModoPagamentoClient } from './modo-pagamento-client'

export const ModoPagamentoService = (idFuncionalidade = '') =>
  new ModoPagamentoClient(idFuncionalidade)
