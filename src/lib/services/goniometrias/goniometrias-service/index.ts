import { GoniometriasClient } from './goniometrias-client'

export const GoniometriasService = (idFuncionalidade = '') =>
    new GoniometriasClient(idFuncionalidade)
export * from './goniometrias-errors'
export * from './goniometrias-client'
