import { OrdemEntradaAdministrativoClient } from './ordem-entrada-administrativo-client'

export const OrdemEntradaAdministrativoService = (idFuncionalidade = '') =>
  new OrdemEntradaAdministrativoClient(idFuncionalidade)
export * from './ordem-entrada-administrativo-errors'
export * from './ordem-entrada-administrativo-client'
