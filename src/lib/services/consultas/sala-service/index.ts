import { SalaClient } from './sala-client'

export const SalaService = (idFuncionalidade = '') => new SalaClient(idFuncionalidade)
export * from './sala-errors'
export * from './sala-client'
