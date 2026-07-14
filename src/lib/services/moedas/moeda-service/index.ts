import { MoedaClient } from './moeda-client'

export const MoedaService = (idFuncionalidade = '') =>
  new MoedaClient(idFuncionalidade)
export * from './moeda-errors'
export * from './moeda-client'
