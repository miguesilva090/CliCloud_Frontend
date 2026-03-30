import { RelatorioAtestadoClient } from '@/lib/services/processo-clinico/relatorio-atestado-service/relatorio-atestado-client'

export const RelatorioAtestadoService = (idFuncionalidade = 'PClinico_FichaClinica') =>
  new RelatorioAtestadoClient(idFuncionalidade)

export * from '@/lib/services/processo-clinico/relatorio-atestado-service/relatorio-atestado-client'

