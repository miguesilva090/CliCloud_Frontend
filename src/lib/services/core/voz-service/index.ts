import { VozClient } from './voz-client'
export { VozRuntimeService } from './voz-runtime'

export const VozService = (idFuncionalidade = '') => new VozClient(idFuncionalidade)
