import { MotivoAltaClient } from './motivo-alta-client'

export const MotivoAltaService = (idFuncionalidade = '') =>
    new MotivoAltaClient(idFuncionalidade)
