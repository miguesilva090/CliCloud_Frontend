import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TemperaturaCorporalService } from '@/lib/services/processo-clinico/sinais-vitais/temperatura-corporal-service'
import type {
  CreateTemperaturaCorporalRequest,
  TemperaturaCorporalTableFilterRequest,
  UpdateTemperaturaCorporalRequest,
} from '@/types/dtos/sinais-vitais/temperatura-corporal.dtos'

type Filters = TemperaturaCorporalTableFilterRequest['filters']

export function useGetTemperaturaCorporalPaginated(
  utenteId: string,
  pageNumber: number,
  pageSize: number
) {
  const filters: Filters =
    utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

  const params = {
    pageNumber,
    pageSize,
    filters: filters.length > 0 ? filters : undefined,
  }

  return useQuery({
    queryKey: ['temperatura-corporal', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => TemperaturaCorporalService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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
