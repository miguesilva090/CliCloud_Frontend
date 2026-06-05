import { FicheirosEletronicosClient } from './ficheiros-eletronicos-client'

export const FicheirosEletronicosService = (idFuncionalidade = '') =>
    new FicheirosEletronicosClient(idFuncionalidade)