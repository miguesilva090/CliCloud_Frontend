import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useCreateEvolucaoTratamentoFicheiro(evolucaoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<CreateEvolucaoTratamentoFicheiroRequest, 'evolucaoTratamentoId'>) => {
      const body: CreateEvolucaoTratamentoFicheiroRequest = {
        evolucaoTratamentoId: evolucaoId,
        ...payload,
      }
      const res = await EvolucaoTratamentoFicheirosService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao anexar ficheiro.'
        throw new Error(String(firstMsg))
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['evolucao-tratamento-ficheiros', evolucaoId],
      })
    },
  })
}

export function useDeleteEvolucaoTratamentoFicheiro(evolucaoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await EvolucaoTratamentoFicheirosService().delete(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['evolucao-tratamento-ficheiros', evolucaoId],
      })
    },
  })
}

