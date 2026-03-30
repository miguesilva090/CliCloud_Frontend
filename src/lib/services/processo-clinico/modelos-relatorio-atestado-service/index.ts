import { ModelosRelatorioAtestadoClient } from './modelos-relatorio-atestado-client'

export const ModelosRelatorioAtestadoService = (idFuncionalidade = 'PClinico_FichaClinica') =>
  new ModelosRelatorioAtestadoClient(idFuncionalidade)

export * from './modelos-relatorio-atestado-client'

