import { ListaEsperaAdministrativoClient } from './lista-espera-administrativo-client'

export const ListaEsperaAdministrativoService = (idFuncionalidade = '') =>
  new ListaEsperaAdministrativoClient(idFuncionalidade)
export * from './lista-espera-administrativo-errors'
export * from './lista-espera-administrativo-client'
