import { MarcacoesAdministrativoClient } from './marcacoes-administrativo-client'

export const MarcacoesAdministrativoService = (idFuncionalidade = '') =>
  new MarcacoesAdministrativoClient(idFuncionalidade)
export * from './marcacoes-administrativo-errors'
export * from './marcacoes-administrativo-client'
