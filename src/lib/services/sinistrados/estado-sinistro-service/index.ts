import { EstadoSinistroClient } from './estado-sinistro-client'

export const EstadoSinistroService = (idFuncionalidade = '') =>
    new EstadoSinistroClient(idFuncionalidade)