import { LoteDirectClient } from "./lote-direct-client"

export const LoteDirectService = (idFuncionalidade = '') =>
    new LoteDirectClient(idFuncionalidade)