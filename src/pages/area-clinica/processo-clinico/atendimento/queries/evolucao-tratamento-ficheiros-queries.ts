import { useQuery } from '@tanstack/react-query'
import { EvolucaoTratamentoFicheirosService } from '@/lib/services/tratamentos/evolucao-tratamento-ficheiros-service'

import type {
  EvolucaoTratamentoFicheiroDTO,
  CreateEvolucaoTratamentoFicheiroRequest,
} from '@/types/dtos/tratamentos/evolucao-tratamento-ficheiro.dtos'

export function useGetEvolucaoTratamentoFicheiros(evolucaoId: string) {
  return useQuery({
    queryKey: ['evolucao-tratamento-ficheiros', evolucaoId],
    queryFn: async () => {
      const res = await EvolucaoTratamentoFicheirosService().getByEvolucaoId(evolucaoId)
      return (res.info?.data ?? []) as EvolucaoTratamentoFicheiroDTO[]
    },
    enabled: !!evolucaoId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateEvolucaoTratamentoFicheiro, useDeleteEvolucaoTratamentoFicheiro } from './evolucao-tratamento-ficheiros-mutations'
