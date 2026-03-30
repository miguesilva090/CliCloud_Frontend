import { LocalTratamentoClient } from './local-tratamento-client'

export const LocalTratamentoService = (idFuncionalidade = '') =>
  new LocalTratamentoClient(idFuncionalidade)
