import { TipoConsultaClient } from './tipo-consulta-client'

export const TipoConsultaService = (idFuncionalidade = '') =>
  new TipoConsultaClient(idFuncionalidade)
