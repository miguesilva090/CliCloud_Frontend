import { ExameClient } from './exame-client'

export const ExameService = (idFuncionalidade = '') =>
    new ExameClient(idFuncionalidade)
