import { FicheirosEletronicosClient } from './ficheiros-eletronicos-client'

export const FicheirosEletronicosService = (idFuncionalidade = '') =>
    new FicheirosEletronicosClient(idFuncionalidade)
export * from './ficheiros-eletronicos-errors'
export * from './ficheiros-eletronicos-client'
