import { TipoEntidadeFinanceiraClient } from './tipo-entidade-financeira-client'

const TipoEntidadeFinanceiraService = (idFuncionalidade: string) =>
  new TipoEntidadeFinanceiraClient(idFuncionalidade)

export { TipoEntidadeFinanceiraService }
export * from './tipo-entidade-financeira-client'

