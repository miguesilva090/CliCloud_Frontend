import { ReplicarMargemMedicosClient } from './replicar-margem-medicos-client'

export const ReplicarMargemMedicosService = (idFuncionalidade = '') =>
  new ReplicarMargemMedicosClient(idFuncionalidade)
