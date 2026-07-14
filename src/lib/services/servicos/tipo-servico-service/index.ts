import { TipoServicoClient } from './tipo-servico-client'

export const TipoServicoService = (idFuncionalidade = '') =>
  new TipoServicoClient(idFuncionalidade)
export * from './tipo-servico-errors'
export * from './tipo-servico-client'
