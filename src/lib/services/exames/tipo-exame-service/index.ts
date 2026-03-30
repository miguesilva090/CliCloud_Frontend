import { TipoExameClient } from './tipo-exame-client'

export const TipoExameService = (idFuncionalidade = '') =>
    new TipoExameClient(idFuncionalidade)
