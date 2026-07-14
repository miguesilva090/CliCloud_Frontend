import { FundirUtentesClient } from './fundir-utentes-client'

export const FundirUtentesService = (idFuncionalidade = '') =>
  new FundirUtentesClient(idFuncionalidade)
export * from './fundir-utentes-errors'
export * from './fundir-utentes-client'
