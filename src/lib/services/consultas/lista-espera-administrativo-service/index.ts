import { ListaEsperaAdministrativoClient } from './lista-espera-administrativo-client'

export const ListaEsperaAdministrativoService = (idFuncionalidade = '') =>
  new ListaEsperaAdministrativoClient(idFuncionalidade)
