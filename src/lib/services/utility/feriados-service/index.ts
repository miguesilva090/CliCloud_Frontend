import { FeriadoClient } from './feriados-client'

export const FeriadoService = (idFuncionalidade = '') => 
    new FeriadoClient(idFuncionalidade)
export * from './feriados-errors'
export * from './feriados-client'
