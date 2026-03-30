import { MargemMedicoClient } from './margem-medico-client'

export const MargemMedicoService = (idFuncionalidade = '') =>
    new MargemMedicoClient(idFuncionalidade)
