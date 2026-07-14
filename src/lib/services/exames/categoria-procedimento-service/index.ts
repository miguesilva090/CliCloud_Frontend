import { CategoriaProcedimentoClient } from './categoria-procedimento-client'

export const CategoriaProcedimentoService = (idFuncionalidade = '') =>
    new CategoriaProcedimentoClient(idFuncionalidade)
export * from './categoria-procedimento-errors'
export * from './categoria-procedimento-client'
