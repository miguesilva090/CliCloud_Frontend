import { EstadoSinistroClient } from './estado-sinistro-client'

export const EstadoSinistroService = (idFuncionalidade = '') =>
    new EstadoSinistroClient(idFuncionalidade)
export * from './estado-sinistro-errors'
export * from './estado-sinistro-client'
