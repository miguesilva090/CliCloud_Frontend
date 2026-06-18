import { ArmazemClient } from './armazem-client'

export const ArmazemService = (idFuncionalidade = '') =>
    new ArmazemClient(idFuncionalidade)