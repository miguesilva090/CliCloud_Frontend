import { ServicoConsultaClient } from './servico-consulta-client'

export const ServicoConsultaService = (idFuncionalidade = '') =>
  new ServicoConsultaClient(idFuncionalidade)
export * from './servico-consulta-errors'
export * from './servico-consulta-client'
