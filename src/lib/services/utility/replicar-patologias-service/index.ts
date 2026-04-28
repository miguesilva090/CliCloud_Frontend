import { ReplicarPatologiasClient } from './replicar-patologias-client'
export const ReplicarPatologiasService = (idFuncionalidade = '') => 
    new ReplicarPatologiasClient(idFuncionalidade)