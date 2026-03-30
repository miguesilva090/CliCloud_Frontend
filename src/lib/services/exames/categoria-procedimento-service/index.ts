import { CategoriaProcedimentoClient } from './categoria-procedimento-client'

export const CategoriaProcedimentoService = (idFuncionalidade = '') =>
    new CategoriaProcedimentoClient(idFuncionalidade)