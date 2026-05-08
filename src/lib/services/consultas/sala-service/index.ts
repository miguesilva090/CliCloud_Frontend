import { SalaClient } from './sala-client'

export const SalaService = (idFuncionalidade = '') => new SalaClient(idFuncionalidade)
