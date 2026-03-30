import { MotivoIsencaoClient } from './motivo-isencao-client'

export const MotivoIsencaoService = (idFuncionalidade = '') =>
  new MotivoIsencaoClient(idFuncionalidade)
