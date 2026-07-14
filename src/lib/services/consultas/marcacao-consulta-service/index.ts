import { MarcacaoConsultaClient } from './marcacao-consulta-client'

export const MarcacaoConsultaService = (idFuncionalidade = '') =>
  new MarcacaoConsultaClient(idFuncionalidade)
export * from './marcacao-consulta-errors'
export * from './marcacao-consulta-client'
