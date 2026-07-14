import { AlergiaClient } from './alergia-client'

export const AlergiaService = (idFuncionalidade = '') =>
  new AlergiaClient(idFuncionalidade)
export * from './alergia-errors'
export * from './alergia-client'
