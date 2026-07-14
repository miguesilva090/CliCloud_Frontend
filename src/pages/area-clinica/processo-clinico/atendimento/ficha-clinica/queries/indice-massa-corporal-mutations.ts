import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IndiceMassaCorporalService } from '@/lib/services/processo-clinico/sinais-vitais/indice-massa-corporal-service'
import type {
  CreateIndiceMassaCorporalRequest,
  IndiceMassaCorporalTableFilterRequest,
  UpdateIndiceMassaCorporalRequest,
} from '@/types/dtos/sinais-vitais/indice-massa-corporal.dtos'

export function useCreateIndiceMassaCorporal(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateIndiceMassaCorporalRequest, 'utenteId'>) => {
      const body: CreateIndiceMassaCorporalRequest = { utenteId, ...data }
      const res = await IndiceMassaCorporalService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar IMC.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['indice-massa-corporal', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateIndiceMassaCorporal(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      data: UpdateIndiceMassaCorporalRequest
    }) => {
      return IndiceMassaCorporalService().update(payload.id, payload.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['indice-massa-corporal', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteIndiceMassaCorporal(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = IndiceMassaCorporalService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['indice-massa-corporal', 'paginated', utenteId],
      })
    },
  })
}
