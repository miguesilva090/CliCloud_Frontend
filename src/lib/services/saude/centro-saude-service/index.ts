import { CentroSaudeClient } from './centro-saude-client'

export const CentroSaudeService = (idFuncionalidade = '') =>
  new CentroSaudeClient(idFuncionalidade)
export * from './centro-saude-errors'
export * from './centro-saude-client'
