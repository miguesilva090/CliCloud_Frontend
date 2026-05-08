import { SinistradoClient } from './sinistrado-client'

export const SinistradoService = (idFuncionalidade = '') =>
  new SinistradoClient(idFuncionalidade)
