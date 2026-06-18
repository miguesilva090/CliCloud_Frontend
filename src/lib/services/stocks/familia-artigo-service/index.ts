import { FamiliaArtigoClient } from './familia-artigo-client'

export const FamiliaArtigoService = (idFuncionalidade = '') =>
    new FamiliaArtigoClient(idFuncionalidade)