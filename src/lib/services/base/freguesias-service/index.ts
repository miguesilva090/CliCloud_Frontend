import { FreguesiasClient } from './freguesias-client'

const FreguesiasService = (idFuncionalidade: string) =>
  new FreguesiasClient(idFuncionalidade)

export { FreguesiasService }

export * from './freguesias-client'
export * from './freguesias-errors'
