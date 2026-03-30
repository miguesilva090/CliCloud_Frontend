import { AtestadosClient } from './atestados-client'

export const AtestadosService = (idFuncionalidade: string) =>
  new AtestadosClient(idFuncionalidade)

export * from './atestados-client'
export * from './atestados-queries'
