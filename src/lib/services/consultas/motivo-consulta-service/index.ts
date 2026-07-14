import { MotivoConsultaClient } from './motivo-consulta-client'

export const MotivoConsultaService = (idFuncionalidade = '') =>
  new MotivoConsultaClient(idFuncionalidade)
export * from './motivo-consulta-errors'
export * from './motivo-consulta-client'
