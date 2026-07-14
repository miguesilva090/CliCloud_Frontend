import { GlicemiaCapilarClient } from './glicemia-capilar-client'

export const GlicemiaCapilarService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new GlicemiaCapilarClient(idFuncionalidade)

export * from './glicemia-capilar-client'
export * from './glicemia-capilar-errors'
