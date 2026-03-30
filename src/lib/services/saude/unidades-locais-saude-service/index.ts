import { UnidadesLocaisSaudeClient } from './unidades-locais-saude-client'

export const UnidadesLocaisSaudeService = (idFuncionalidade = '') =>
  new UnidadesLocaisSaudeClient(idFuncionalidade)

