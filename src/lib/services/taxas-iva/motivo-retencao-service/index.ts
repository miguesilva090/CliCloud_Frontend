import { MotivoRetencaoClient } from './motivo-retencao-client'

export const MotivoRetencaoService = (idFuncionalidade = '') =>
  new MotivoRetencaoClient(idFuncionalidade)
export * from './motivo-retencao-errors'
export * from './motivo-retencao-client'
