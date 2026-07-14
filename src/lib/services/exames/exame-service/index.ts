import { ExameClient } from './exame-client'

export const ExameService = (idFuncionalidade = '') =>
    new ExameClient(idFuncionalidade)
export * from './exame-errors'
export * from './exame-client'
