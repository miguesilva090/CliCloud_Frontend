import { AnalisesClient } from './analises-client'

export const AnalisesService = (idFuncionalidade = '') => 
    new AnalisesClient(idFuncionalidade)
export * from './analises-errors'
export * from './analises-client'
