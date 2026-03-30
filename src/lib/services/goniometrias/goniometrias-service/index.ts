import { GoniometriasClient } from './goniometrias-client'

export const GoniometriasService = (idFuncionalidade = '') =>
    new GoniometriasClient(idFuncionalidade)