import { SeguradoraClient } from './seguradora-client'

export const SeguradoraService = (idFuncionalidade = '') =>
  new SeguradoraClient(idFuncionalidade)
