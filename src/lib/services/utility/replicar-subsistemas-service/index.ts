import { ReplicarSubsistemasClient } from './replicar-subsistemas-client'

export const ReplicarSubsistemasService = (idFuncionalidade = '') =>
  new ReplicarSubsistemasClient(idFuncionalidade)
