import { ReplicarMargemMedicosClient } from './replicar-margem-medicos-client'

export const ReplicarMargemMedicosService = (idFuncionalidade = '') =>
  new ReplicarMargemMedicosClient(idFuncionalidade)
export * from './replicar-margem-medicos-errors'
export * from './replicar-margem-medicos-client'
