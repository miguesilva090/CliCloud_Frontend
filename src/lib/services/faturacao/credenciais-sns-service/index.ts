import { CredenciaisSnsClient } from './credenciais-sns-client'

export const CredenciaisSnsService = (idFuncionalidade = '') =>
  new CredenciaisSnsClient(idFuncionalidade)
