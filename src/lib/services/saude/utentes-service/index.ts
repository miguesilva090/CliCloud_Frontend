import { UtentesClient } from './utentes-client'

export const UtentesService = (idFuncionalidade: string) =>
  new UtentesClient(idFuncionalidade)

export * from './utentes-client'
export * from './utentes-errors'

