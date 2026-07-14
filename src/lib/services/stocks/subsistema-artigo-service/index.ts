import { SubsistemaArtigoClient } from './subsistema-artigo-client'

export const SubsistemaArtigoService = (idFuncionalidade = '') =>
    new SubsistemaArtigoClient(idFuncionalidade)
export * from './subsistema-artigo-errors'
export * from './subsistema-artigo-client'
