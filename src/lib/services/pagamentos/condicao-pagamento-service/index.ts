import { CondicaoPagamentoClient } from './condicao-pagamento-client'

export const CondicaoPagamentoService = (idFuncionalidade = '') =>
  new CondicaoPagamentoClient(idFuncionalidade)
