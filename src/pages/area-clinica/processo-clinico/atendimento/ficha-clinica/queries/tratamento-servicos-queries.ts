import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServicoTratamentoService } from '@/lib/services/tratamentos/servico-tratamento-service'
import type {
  CreateServicoTratamentoRequest,
  ServicoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/servico-tratamento.dtos'
import type { AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export function useServicoTratamentoByTratamento(tratamentoId?: string | null) {
  return useQuery({
    queryKey: ['servicos-tratamento', tratamentoId],
    queryFn: async () => {
      if (!tratamentoId) return [] as ServicoTratamentoTableDTO[]

      const body: AllFilterRequest = {
        filters: [{ id: 'tratamentoId', value: tratamentoId }],
        sorting: [{ id: 'ordem', desc: false }],
      }

      const res = await ServicoTratamentoService().getAll(body)
      return (res.info?.data ?? []) as ServicoTratamentoTableDTO[]
    },
    enabled: !!tratamentoId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useServicoTratamentoMutations(tratamentoId: string | null) {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: async (data: Omit<CreateServicoTratamentoRequest, 'tratamentoId'>) => {
      if (!tratamentoId) throw new Error('TratamentoId em falta.')
      const body: CreateServicoTratamentoRequest = {
        tratamentoId,
        ...data,
      }
      const res = await ServicoTratamentoService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat() as string[])[0] ?? 'Erro ao adicionar serviço ao tratamento.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['servicos-tratamento', tratamentoId],
      })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await ServicoTratamentoService().delete(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['servicos-tratamento', tratamentoId],
      })
    },
  })

  return { create, remove }
}

