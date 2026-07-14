import { TipoConsultaClient } from './tipo-consulta-client'

export const TipoConsultaService = (idFuncionalidade = '') =>
  new TipoConsultaClient(idFuncionalidade)
export * from './tipo-consulta-errors'
export * from './tipo-consulta-client'
