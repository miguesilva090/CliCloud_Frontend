import { EvolucaoTratamentoFicheirosClient } from './evolucao-tratamento-ficheiros-client'

export function EvolucaoTratamentoFicheirosService() {
  return new EvolucaoTratamentoFicheirosClient('EvolucaoTratamentoFicheiros')
}
export * from './evolucao-tratamento-ficheiros-errors'
export * from './evolucao-tratamento-ficheiros-client'
