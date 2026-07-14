import { ReferenciasMbClient } from './referencias-mb-client'

export const ReferenciasMbService = (idFuncionalidade = '') => new ReferenciasMbClient(idFuncionalidade)
export * from './referencias-mb-errors'
export * from './referencias-mb-client'
