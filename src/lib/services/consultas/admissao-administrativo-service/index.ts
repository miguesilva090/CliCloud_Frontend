import { AdmissaoAdministrativoClient } from './admissao-administrativo-client'

export const AdmissaoAdministrativoService = (idFuncionalidade = '') =>
  new AdmissaoAdministrativoClient(idFuncionalidade)
