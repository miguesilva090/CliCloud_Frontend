import { GrupoSanguineoClient } from './grupo-sanguineo-client'

export const GrupoSanguineoService = (idFuncionalidade = '') =>
  new GrupoSanguineoClient(idFuncionalidade)
