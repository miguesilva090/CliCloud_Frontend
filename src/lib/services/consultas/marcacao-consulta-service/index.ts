import { MarcacaoConsultaClient } from './marcacao-consulta-client'

export const MarcacaoConsultaService = (idFuncionalidade = '') =>
  new MarcacaoConsultaClient(idFuncionalidade)

