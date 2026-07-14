import { ArtigoClient } from './artigo-client'

export const ArtigoService = (idFuncionalidade = '') =>
  new ArtigoClient(idFuncionalidade)
export * from './artigo-errors'
export * from './artigo-client'
