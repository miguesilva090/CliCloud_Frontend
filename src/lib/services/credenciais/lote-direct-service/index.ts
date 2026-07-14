import { LoteDirectClient } from "./lote-direct-client"

export const LoteDirectService = (idFuncionalidade = '') =>
    new LoteDirectClient(idFuncionalidade)
export * from './lote-direct-errors'
export * from './lote-direct-client'
