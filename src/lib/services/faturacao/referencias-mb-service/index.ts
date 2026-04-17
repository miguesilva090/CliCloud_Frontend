import { ReferenciasMbClient } from './referencias-mb-client'

export const ReferenciasMbService = (idFuncionalidade = '') => new ReferenciasMbClient(idFuncionalidade)
