import { PeriocidadeTratamentoClient } from './periocidade-tratamento-client'

export const PeriocidadeTratamentoService = (
  idFuncionalidade = 'PClinico_Tratamentos',
) => new PeriocidadeTratamentoClient(idFuncionalidade)

