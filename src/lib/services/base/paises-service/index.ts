import { PaisesClient } from './paises-client'

const PaisesService = (idFuncionalidade: string) =>
  new PaisesClient(idFuncionalidade)

export { PaisesService }

export * from './paises-client'
export * from './paises-errors'
