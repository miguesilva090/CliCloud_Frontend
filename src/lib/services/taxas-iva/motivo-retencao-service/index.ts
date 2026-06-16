import { MotivoRetencaoClient } from './motivo-retencao-client'

export const MotivoRetencaoService = (idFuncionalidade = '') =>
  new MotivoRetencaoClient(idFuncionalidade)
