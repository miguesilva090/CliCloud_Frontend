import { ConsultaClient } from './consulta-client'

export const ConsultaService = (idFuncionalidade = '') =>
  new ConsultaClient(idFuncionalidade)
export * from './consulta-errors'
export * from './consulta-client'
