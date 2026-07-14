import { ReplicarPatologiasClient } from './replicar-patologias-client'
export const ReplicarPatologiasService = (idFuncionalidade = '') => 
    new ReplicarPatologiasClient(idFuncionalidade)
export * from './replicar-patologias-errors'
export * from './replicar-patologias-client'
