import { ConcelhosClient } from './concelhos-client'

const ConcelhosService = (idFuncionalidade: string) =>
  new ConcelhosClient(idFuncionalidade)

export { ConcelhosService }

export * from './concelhos-client'
export * from './concelhos-errors'
