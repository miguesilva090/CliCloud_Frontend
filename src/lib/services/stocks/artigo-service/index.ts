import { ArtigoClient } from './artigo-client'

export const ArtigoService = (idFuncionalidade = '') =>
  new ArtigoClient(idFuncionalidade)
