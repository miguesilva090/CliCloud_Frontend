import { HistoricoConsultasAdministrativoClient } from './historico-consultas-administrativo-client'

export const HistoricoConsultasAdministrativoService = (idFuncionalidade = '') =>
  new HistoricoConsultasAdministrativoClient(idFuncionalidade)
export * from './historico-consultas-administrativo-errors'
export * from './historico-consultas-administrativo-client'
