import { RegiaoCorpoClient } from './regiao-corpo-client'

export const RegiaoCorpoService = (idFuncionalidade = '') =>
    new RegiaoCorpoClient(idFuncionalidade)