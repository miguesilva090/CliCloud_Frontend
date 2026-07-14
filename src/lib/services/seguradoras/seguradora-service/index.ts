import { SeguradoraClient } from './seguradora-client'

export const SeguradoraService = (idFuncionalidade = '') =>
  new SeguradoraClient(idFuncionalidade)
export * from './seguradora-errors'
export * from './seguradora-client'
