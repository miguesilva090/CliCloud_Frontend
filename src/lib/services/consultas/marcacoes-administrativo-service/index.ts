import { MarcacoesAdministrativoClient } from './marcacoes-administrativo-client'

export const MarcacoesAdministrativoService = (idFuncionalidade = '') =>
  new MarcacoesAdministrativoClient(idFuncionalidade)
