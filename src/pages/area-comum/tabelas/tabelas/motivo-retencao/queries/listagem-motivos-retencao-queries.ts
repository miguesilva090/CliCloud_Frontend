import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { MotivoRetencaoService } from '@/lib/services/taxas-iva/motivo-retencao-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetMotivosRetencaoPaginated(
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
    queryKey: ['motivos-retencao-paginated', params],
    queryFn: () => MotivoRetencaoService().getMotivosRetencaoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentMotivosRetencao(
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
        queryKey: ['motivos-retencao-paginated', params],
        queryFn: () => MotivoRetencaoService().getMotivosRetencaoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['motivos-retencao-paginated', params],
      queryFn: () => MotivoRetencaoService().getMotivosRetencaoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
