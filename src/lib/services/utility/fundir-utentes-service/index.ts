import { FundirUtentesClient } from './fundir-utentes-client'

export const FundirUtentesService = (idFuncionalidade = '') =>
  new FundirUtentesClient(idFuncionalidade)
