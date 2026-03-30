import { AnalisesClient } from './analises-client'

export const AnalisesService = (idFuncionalidade = '') => 
    new AnalisesClient(idFuncionalidade)