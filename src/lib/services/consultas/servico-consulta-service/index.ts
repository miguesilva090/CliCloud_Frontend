import { ServicoConsultaClient } from './servico-consulta-client'

export const ServicoConsultaService = (idFuncionalidade = '') =>
  new ServicoConsultaClient(idFuncionalidade)

