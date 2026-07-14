import { ReplicarSubsistemasClient } from './replicar-subsistemas-client'

export const ReplicarSubsistemasService = (idFuncionalidade = '') =>
  new ReplicarSubsistemasClient(idFuncionalidade)
export * from './replicar-subsistemas-errors'
export * from './replicar-subsistemas-client'
