import { TipoDeDorClient } from './tipo-de-dor-client'

export const TipoDeDorService = (idFuncionalidade = '') =>
  new TipoDeDorClient(idFuncionalidade)
export * from './tipo-de-dor-errors'
export * from './tipo-de-dor-client'
