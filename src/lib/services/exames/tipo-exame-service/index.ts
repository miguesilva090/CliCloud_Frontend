import { TipoExameClient } from './tipo-exame-client'

export const TipoExameService = (idFuncionalidade = '') =>
    new TipoExameClient(idFuncionalidade)
export * from './tipo-exame-errors'
export * from './tipo-exame-client'
