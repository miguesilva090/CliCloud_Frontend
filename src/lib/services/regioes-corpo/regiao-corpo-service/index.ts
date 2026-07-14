import { RegiaoCorpoClient } from './regiao-corpo-client'

export const RegiaoCorpoService = (idFuncionalidade = '') =>
    new RegiaoCorpoClient(idFuncionalidade)
export * from './regiao-corpo-errors'
export * from './regiao-corpo-client'
