import { CredenciaisSnsClient } from './credenciais-sns-client'

export const CredenciaisSnsService = (idFuncionalidade = '') =>
  new CredenciaisSnsClient(idFuncionalidade)
export * from './credenciais-sns-errors'
export * from './credenciais-sns-client'
