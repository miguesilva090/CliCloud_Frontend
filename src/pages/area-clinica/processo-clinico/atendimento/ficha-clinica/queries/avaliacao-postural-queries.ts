import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AvaliacaoPosturalService } from '@/lib/services/processo-clinico/sinais-vitais/avaliacao-postural-service'
import type {
  CreateAvaliacaoPosturalRequest,
  AvaliacaoPosturalTableFilterRequest,
  UpdateAvaliacaoPosturalRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-postural.dtos'

type Filters = AvaliacaoPosturalTableFilterRequest['filters']

export function useGetAvaliacaoPosturalPaginated(
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
    queryKey: ['avaliacao-postural', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => AvaliacaoPosturalService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateAvaliacaoPostural(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateAvaliacaoPosturalRequest, 'utenteId'>) => {
      const body: CreateAvaliacaoPosturalRequest = { utenteId, ...data }
      const res = await AvaliacaoPosturalService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar avaliação postural.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-postural', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateAvaliacaoPostural(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateAvaliacaoPosturalRequest }) => {
      const res = await AvaliacaoPosturalService().update(payload.id, payload.data)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar avaliação postural.'
        throw new Error(String(firstMsg))
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-postural', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteAvaliacaoPostural(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = AvaliacaoPosturalService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-postural', 'paginated', utenteId],
      })
    },
  })
}
