import { MotivoConsultaClient } from './motivo-consulta-client'

export const MotivoConsultaService = (idFuncionalidade = '') =>
  new MotivoConsultaClient(idFuncionalidade)
