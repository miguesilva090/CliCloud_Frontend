import { MargemMedicoClient } from './margem-medico-client'

export const MargemMedicoService = (idFuncionalidade = '') =>
    new MargemMedicoClient(idFuncionalidade)
export * from './margem-medico-errors'
export * from './margem-medico-client'
