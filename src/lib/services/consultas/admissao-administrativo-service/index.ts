import { AdmissaoAdministrativoClient } from './admissao-administrativo-client'

export const AdmissaoAdministrativoService = (idFuncionalidade = '') =>
  new AdmissaoAdministrativoClient(idFuncionalidade)
export * from './admissao-administrativo-errors'
export * from './admissao-administrativo-client'
