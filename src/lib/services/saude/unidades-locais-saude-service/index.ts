import { UnidadesLocaisSaudeClient } from './unidades-locais-saude-client'

export const UnidadesLocaisSaudeService = (idFuncionalidade = '') =>
  new UnidadesLocaisSaudeClient(idFuncionalidade)
export * from './unidades-locais-saude-errors'
export * from './unidades-locais-saude-client'
