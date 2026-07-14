import { MotivoAltaClient } from './motivo-alta-client'

export const MotivoAltaService = (idFuncionalidade = '') =>
    new MotivoAltaClient(idFuncionalidade)

export * from './motivo-alta-client'
export * from './motivo-alta-errors'
