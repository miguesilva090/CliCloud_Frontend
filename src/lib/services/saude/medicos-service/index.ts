import { MedicosClient } from './medicos-client'

export const MedicosService = (idFuncionalidade: string) =>
  new MedicosClient(idFuncionalidade)

export * from './medicos-client'
