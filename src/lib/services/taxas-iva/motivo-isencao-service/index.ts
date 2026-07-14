import { MotivoIsencaoClient } from './motivo-isencao-client'

export const MotivoIsencaoService = (idFuncionalidade = '') =>
  new MotivoIsencaoClient(idFuncionalidade)
export * from './motivo-isencao-errors'
export * from './motivo-isencao-client'
