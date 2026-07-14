import { PeriocidadeTratamentoClient } from './periocidade-tratamento-client'

export const PeriocidadeTratamentoService = (
  idFuncionalidade = 'PClinico_Tratamentos',
) => new PeriocidadeTratamentoClient(idFuncionalidade)
export * from './periocidade-tratamento-errors'
export * from './periocidade-tratamento-client'
