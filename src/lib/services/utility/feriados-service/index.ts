import { FeriadoClient } from './feriados-client'

export const FeriadoService = (idFuncionalidade = '') => 
    new FeriadoClient(idFuncionalidade)