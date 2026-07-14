import { EvolucaoTratamentoClient } from './evolucao-tratamento-client'

export const EvolucaoTratamentoService = (idFuncionalidade = 'PClinico_Tratamentos') => 
    new EvolucaoTratamentoClient(idFuncionalidade)
export * from './evolucao-tratamento-errors'
export * from './evolucao-tratamento-client'
