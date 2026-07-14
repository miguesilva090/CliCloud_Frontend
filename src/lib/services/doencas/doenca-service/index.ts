import { DoencaClient } from './doenca-client'

export const DoencaService = (idFuncionalidade = '') =>
  new DoencaClient(idFuncionalidade)
export * from './doenca-errors'
export * from './doenca-client'
