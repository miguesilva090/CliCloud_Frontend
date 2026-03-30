import { CodigosPostaisClient } from './codigospostais-client'

const CodigosPostaisService = (idFuncionalidade: string) =>
  new CodigosPostaisClient(idFuncionalidade)

export { CodigosPostaisService }

export * from './codigospostais-client'
export * from './codigospostais-errors'
