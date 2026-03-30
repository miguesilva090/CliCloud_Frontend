import { GrauAlergiaClient } from './grau-alergia-client'

export const GrauAlergiaService = (idFuncionalidade = '') =>
  new GrauAlergiaClient(idFuncionalidade)
