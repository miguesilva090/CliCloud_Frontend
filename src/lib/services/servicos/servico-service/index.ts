import { ServicoClient } from './servico-client'

export const ServicoService = (idFuncionalidade = '') => new ServicoClient(idFuncionalidade)
export * from './servico-errors'
export * from './servico-client'
