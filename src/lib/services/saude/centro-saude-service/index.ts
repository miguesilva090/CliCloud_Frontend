import { CentroSaudeClient } from './centro-saude-client'

export const CentroSaudeService = (idFuncionalidade = '') =>
  new CentroSaudeClient(idFuncionalidade)
