import { DistritosClient } from './distritos-client'

const DistritosService = (idFuncionalidade: string) =>
  new DistritosClient(idFuncionalidade)

export { DistritosService }

export * from './distritos-client'
export * from './distritos-errors'
