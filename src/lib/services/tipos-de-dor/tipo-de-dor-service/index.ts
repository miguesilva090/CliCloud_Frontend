import { TipoDeDorClient } from './tipo-de-dor-client'

export const TipoDeDorService = (idFuncionalidade = '') =>
  new TipoDeDorClient(idFuncionalidade)
