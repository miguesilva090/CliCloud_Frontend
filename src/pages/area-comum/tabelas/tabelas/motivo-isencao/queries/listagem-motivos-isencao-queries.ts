import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetMotivosIsencaoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['motivos-isencao-paginated', params],
    queryFn: () => MotivoIsencaoService().getMotivosIsencaoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentMotivosIsencao(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['motivos-isencao-paginated', params],
        queryFn: () => MotivoIsencaoService().getMotivosIsencaoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['motivos-isencao-paginated', params],
      queryFn: () => MotivoIsencaoService().getMotivosIsencaoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
