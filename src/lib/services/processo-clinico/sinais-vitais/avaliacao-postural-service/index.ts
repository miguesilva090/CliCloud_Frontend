import { AvaliacaoPosturalClient } from './avaliacao-postural-client'

export const AvaliacaoPosturalService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new AvaliacaoPosturalClient(idFuncionalidade)

export * from './avaliacao-postural-client'
export * from './avaliacao-postural-errors'
