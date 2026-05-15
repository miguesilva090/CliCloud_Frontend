import { HistoricoConsultasAdministrativoClient } from './historico-consultas-administrativo-client'

export const HistoricoConsultasAdministrativoService = (idFuncionalidade = '') =>
  new HistoricoConsultasAdministrativoClient(idFuncionalidade)
