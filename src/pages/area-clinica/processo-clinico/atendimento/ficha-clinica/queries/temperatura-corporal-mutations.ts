import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TemperaturaCorporalService } from '@/lib/services/processo-clinico/sinais-vitais/temperatura-corporal-service'
import type {
  CreateTemperaturaCorporalRequest,
  TemperaturaCorporalTableFilterRequest,
  UpdateTemperaturaCorporalRequest,
} from '@/types/dtos/sinais-vitais/temperatura-corporal.dtos'

export function useCreateTemperaturaCorporal(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateTemperaturaCorporalRequest, 'utenteId'>) => {
      const body: CreateTemperaturaCorporalRequest = { utenteId, ...data }
      const res = await TemperaturaCorporalService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar temperatura.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['temperatura-corporal', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateTemperaturaCorporal(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      data: UpdateTemperaturaCorporalRequest
    }) => {
      return TemperaturaCorporalService().update(payload.id, payload.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['temperatura-corporal', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteTemperaturaCorporal(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = TemperaturaCorporalService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['temperatura-corporal', 'paginated', utenteId],
      })
    },
  })
}
