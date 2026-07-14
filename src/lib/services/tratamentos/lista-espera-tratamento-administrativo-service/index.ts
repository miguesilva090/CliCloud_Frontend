import { ListaEsperaTratamentoAdministrativoClient } from './lista-espera-tratamento-administrativo-client'

export const ListaEsperaTratamentoAdministrativoService = (idFuncionalidade = '') =>
  new ListaEsperaTratamentoAdministrativoClient(idFuncionalidade)

export * from './lista-espera-tratamento-administrativo-errors'
export * from './lista-espera-tratamento-administrativo-client'
