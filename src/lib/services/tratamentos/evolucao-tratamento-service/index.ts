import { EvolucaoTratamentoClient } from './evolucao-tratamento-client'

export const EvolucaoTratamentoService = (idFuncionalidade = 'PClinico_Tratamentos') => 
    new EvolucaoTratamentoClient(idFuncionalidade)
