import { GorduraMassaMuscularClient } from './gordura-massa-muscular-client'

export const GorduraMassaMuscularService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new GorduraMassaMuscularClient(idFuncionalidade)
