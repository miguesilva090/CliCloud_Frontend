import { ConsultaClient } from './consulta-client'

export const ConsultaService = (idFuncionalidade = '') =>
  new ConsultaClient(idFuncionalidade)
