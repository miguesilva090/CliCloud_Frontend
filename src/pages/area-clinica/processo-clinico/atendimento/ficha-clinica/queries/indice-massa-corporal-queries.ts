import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IndiceMassaCorporalService } from '@/lib/services/processo-clinico/sinais-vitais/indice-massa-corporal-service'
import type {
  CreateIndiceMassaCorporalRequest,
  IndiceMassaCorporalTableFilterRequest,
  UpdateIndiceMassaCorporalRequest,
} from '@/types/dtos/sinais-vitais/indice-massa-corporal.dtos'

type Filters = IndiceMassaCorporalTableFilterRequest['filters']

export function useGetIndiceMassaCorporalPaginated(
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
    queryKey: ['indice-massa-corporal', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => IndiceMassaCorporalService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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
