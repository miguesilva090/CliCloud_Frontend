import { GrauParentescoClient } from './grau-parentesco-client'

export const GrauParentescoService = (idFuncionalidade = '') =>
  new GrauParentescoClient(idFuncionalidade)
