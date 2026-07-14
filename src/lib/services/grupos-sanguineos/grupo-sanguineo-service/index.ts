import { GrupoSanguineoClient } from './grupo-sanguineo-client'

export const GrupoSanguineoService = (idFuncionalidade = '') =>
  new GrupoSanguineoClient(idFuncionalidade)
export * from './grupo-sanguineo-errors'
export * from './grupo-sanguineo-client'
