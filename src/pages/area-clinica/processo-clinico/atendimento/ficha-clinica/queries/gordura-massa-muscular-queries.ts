import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GorduraMassaMuscularService } from '@/lib/services/processo-clinico/sinais-vitais/gordura-massa-muscular-service'
import type {
  CreateGorduraMassaMuscularRequest,
  GorduraMassaMuscularTableFilterRequest,
  UpdateGorduraMassaMuscularRequest,
} from '@/types/dtos/sinais-vitais/gordura-massa-muscular.dtos'

type Filters = GorduraMassaMuscularTableFilterRequest['filters']

export function useGetGorduraMassaMuscularPaginated(
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
    queryKey: ['gordura-massa-muscular', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => GorduraMassaMuscularService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateGorduraMassaMuscular(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateGorduraMassaMuscularRequest, 'utenteId'>) => {
      const body: CreateGorduraMassaMuscularRequest = { utenteId, ...data }
      const res = await GorduraMassaMuscularService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar gordura/massa muscular.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['gordura-massa-muscular', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateGorduraMassaMuscular(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateGorduraMassaMuscularRequest }) => {
      const res = await GorduraMassaMuscularService().update(payload.id, payload.data)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar gordura/massa muscular.'
        throw new Error(String(firstMsg))
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['gordura-massa-muscular', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteGorduraMassaMuscular(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = GorduraMassaMuscularService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['gordura-massa-muscular', 'paginated', utenteId],
      })
    },
  })
}
