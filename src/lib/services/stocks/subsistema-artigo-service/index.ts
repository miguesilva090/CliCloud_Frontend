import { SubsistemaArtigoClient } from './subsistema-artigo-client'

export const SubsistemaArtigoService = (idFuncionalidade = '') =>
    new SubsistemaArtigoClient(idFuncionalidade)