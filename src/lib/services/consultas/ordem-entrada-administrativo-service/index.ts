import { OrdemEntradaAdministrativoClient } from './ordem-entrada-administrativo-client'

export const OrdemEntradaAdministrativoService = (idFuncionalidade = '') =>
  new OrdemEntradaAdministrativoClient(idFuncionalidade)
