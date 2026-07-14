import { GrauAlergiaClient } from './grau-alergia-client'

export const GrauAlergiaService = (idFuncionalidade = '') =>
  new GrauAlergiaClient(idFuncionalidade)
export * from './grau-alergia-errors'
export * from './grau-alergia-client'
