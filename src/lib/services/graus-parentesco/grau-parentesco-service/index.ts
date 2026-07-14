import { GrauParentescoClient } from './grau-parentesco-client'

export const GrauParentescoService = (idFuncionalidade = '') =>
  new GrauParentescoClient(idFuncionalidade)
export * from './grau-parentesco-errors'
export * from './grau-parentesco-client'
