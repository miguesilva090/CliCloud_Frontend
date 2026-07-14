import { FamiliaArtigoClient } from './familia-artigo-client'

export const FamiliaArtigoService = (idFuncionalidade = '') =>
    new FamiliaArtigoClient(idFuncionalidade)
export * from './familia-artigo-errors'
export * from './familia-artigo-client'
