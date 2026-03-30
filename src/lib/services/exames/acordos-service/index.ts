import { AcordosClient } from './acordos-client'

export const AcordosService = (idFuncionalidade = '') =>
  new AcordosClient(idFuncionalidade)
