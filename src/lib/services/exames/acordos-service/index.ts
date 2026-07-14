import { AcordosClient } from './acordos-client'

export const AcordosService = (idFuncionalidade = '') =>
  new AcordosClient(idFuncionalidade)
export * from './acordos-errors'
export * from './acordos-client'
