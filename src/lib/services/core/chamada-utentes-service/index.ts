import { ChamadaUtentesClient } from './chamada-utentes-client'

export const ChamadaUtentesService = (idFuncionalidade = '') =>
  new ChamadaUtentesClient(idFuncionalidade)
export * from './chamada-utentes-errors'
export * from './chamada-utentes-client'
