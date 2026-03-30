import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TensaoArterialService } from '@/lib/services/processo-clinico/sinais-vitais/tensao-arterial-service'
import type {
  CreateTensaoArterialRequest,
  TensaoArterialTableFilterRequest,
  UpdateTensaoArterialRequest,
} from '@/types/dtos/sinais-vitais/tensao-arterial.dtos'

type Filters = TensaoArterialTableFilterRequest['filters']

export function useGetTensaoArterialPaginated(
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
    queryKey: ['tensao-arterial', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => TensaoArterialService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateTensaoArterial(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateTensaoArterialRequest, 'utenteId'>) => {
      const body: CreateTensaoArterialRequest = { utenteId, ...data }
      const res = await TensaoArterialService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar tensão arterial.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tensao-arterial', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateTensaoArterial(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateTensaoArterialRequest }) => {
      return TensaoArterialService().update(payload.id, payload.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tensao-arterial', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteTensaoArterial(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = TensaoArterialService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tensao-arterial', 'paginated', utenteId],
      })
    },
  })
}
