import { ArmazemClient } from './armazem-client'

export const ArmazemService = (idFuncionalidade = '') =>
    new ArmazemClient(idFuncionalidade)
export * from './armazem-errors'
export * from './armazem-client'
