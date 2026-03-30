import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GlicemiaCapilarService } from '@/lib/services/processo-clinico/sinais-vitais/glicemia-capilar-service'
import type {
  CreateGlicemiaCapilarRequest,
  GlicemiaCapilarTableFilterRequest,
  UpdateGlicemiaCapilarRequest,
} from '@/types/dtos/sinais-vitais/glicemia-capilar.dtos'

type Filters = GlicemiaCapilarTableFilterRequest['filters']

export function useGetGlicemiaCapilarPaginated(
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
    queryKey: ['glicemia-capilar', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => GlicemiaCapilarService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateGlicemiaCapilar(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateGlicemiaCapilarRequest, 'utenteId'>) => {
      const body: CreateGlicemiaCapilarRequest = { utenteId, ...data }
      const res = await GlicemiaCapilarService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar glicemia.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['glicemia-capilar', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateGlicemiaCapilar(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateGlicemiaCapilarRequest }) => {
      return GlicemiaCapilarService().update(payload.id, payload.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['glicemia-capilar', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteGlicemiaCapilar(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = GlicemiaCapilarService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['glicemia-capilar', 'paginated', utenteId],
      })
    },
  })
}
