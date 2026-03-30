import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AvaliacaoAntropometricaService } from '@/lib/services/processo-clinico/sinais-vitais/avaliacao-antropometrica-service'
import type {
  CreateAvaliacaoAntropometricaRequest,
  AvaliacaoAntropometricaTableFilterRequest,
  UpdateAvaliacaoAntropometricaRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-antropometrica.dtos'

type Filters = AvaliacaoAntropometricaTableFilterRequest['filters']

export function useGetAvaliacaoAntropometricaPaginated(
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
    queryKey: ['avaliacao-antropometrica', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => AvaliacaoAntropometricaService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateAvaliacaoAntropometrica(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateAvaliacaoAntropometricaRequest, 'utenteId'>) => {
      const body: CreateAvaliacaoAntropometricaRequest = { utenteId, ...data }
      const res = await AvaliacaoAntropometricaService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar avaliação antropométrica.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-antropometrica', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateAvaliacaoAntropometrica(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateAvaliacaoAntropometricaRequest }) => {
      const res = await AvaliacaoAntropometricaService().update(payload.id, payload.data)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar avaliação antropométrica.'
        throw new Error(String(firstMsg))
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-antropometrica', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteAvaliacaoAntropometrica(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = AvaliacaoAntropometricaService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-antropometrica', 'paginated', utenteId],
      })
    },
  })
}
