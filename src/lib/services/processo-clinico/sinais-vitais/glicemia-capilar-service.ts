import { GlicemiaCapilarClient } from './glicemia-capilar-client'

export const GlicemiaCapilarService = (idFuncionalidade = 'PClinico_SinaisVitais') =>
  new GlicemiaCapilarClient(idFuncionalidade)

