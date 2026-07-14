import { SinistradoClient } from './sinistrado-client'

export const SinistradoService = (idFuncionalidade = '') =>
  new SinistradoClient(idFuncionalidade)
export * from './sinistrado-errors'
export * from './sinistrado-client'
